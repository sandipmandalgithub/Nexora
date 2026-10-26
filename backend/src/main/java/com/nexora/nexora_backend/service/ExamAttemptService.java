
package com.nexora.nexora_backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.ExamAttemptResponse;
import com.nexora.nexora_backend.dto.ExamAttemptReviewResponse;
import com.nexora.nexora_backend.dto.ExamQuestionReviewResponse;
import com.nexora.nexora_backend.dto.ExamSubmissionRequest;
import com.nexora.nexora_backend.dto.ExamSubmissionRequest.AnswerSubmission;
import com.nexora.nexora_backend.dto.StudentExamAnalyticsResponse;
import com.nexora.nexora_backend.entity.Exam;
import com.nexora.nexora_backend.entity.ExamAttempt;
import com.nexora.nexora_backend.entity.ExamAttempt.AttemptStatus;
import com.nexora.nexora_backend.entity.ExamAttemptAnswer;
import com.nexora.nexora_backend.entity.ExamQuestion;
import com.nexora.nexora_backend.entity.User;
import com.nexora.nexora_backend.repository.ExamAttemptAnswerRepository;
import com.nexora.nexora_backend.repository.ExamAttemptRepository;
import com.nexora.nexora_backend.repository.ExamQuestionRepository;
import com.nexora.nexora_backend.repository.ExamRepository;

@Service
@Transactional
public class ExamAttemptService {

    private final ExamAttemptRepository attemptRepository;
    private final ExamAttemptAnswerRepository answerRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository questionRepository;
    private final UserService userService;

    public ExamAttemptService(
            ExamAttemptRepository attemptRepository,
            ExamAttemptAnswerRepository answerRepository,
            ExamRepository examRepository,
            ExamQuestionRepository questionRepository,
            UserService userService) {
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.userService = userService;
    }

    public ExamAttemptResponse startAttempt(Long examId, String email) {
        User student = findStudent(email);
        Exam exam = findPublishedExam(examId);

        if (exam.getDurationMinutes() == null
                || exam.getDurationMinutes() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Exam duration must be greater than zero minutes");
        }

        List<ExamQuestion> questions =
                questionRepository.findByExam_IdOrderByQuestionOrderAsc(examId);

        if (questions.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This exam does not have any questions");
        }

        if (attemptRepository.existsByStudent_IdAndExam_IdAndStatus(
                student.getId(), examId, AttemptStatus.IN_PROGRESS)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You already have an in-progress attempt for this exam");
        }

        ExamAttempt attempt = new ExamAttempt();
        attempt.setStudent(student);
        attempt.setExam(exam);
        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempt.setScore(0);
        attempt.setTotalMarks(
                questions.stream()
                        .mapToInt(ExamQuestion::getMarks)
                        .sum());

        return ExamAttemptResponse.from(attemptRepository.save(attempt));
    }

    @Transactional(readOnly = true)
    public List<ExamAttemptResponse> getMyAttempts(String email) {
        User student = findStudent(email);

        return attemptRepository
                .findByStudent_IdOrderByStartedAtDesc(student.getId())
                .stream()
                .map(ExamAttemptResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExamAttemptResponse getMyAttempt(Long attemptId, String email) {
        User student = findStudent(email);

        ExamAttempt attempt = attemptRepository
                .findByIdAndStudent_Id(attemptId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Exam attempt not found"));

        return ExamAttemptResponse.from(attempt);
    }

    @Transactional(readOnly = true)
    public StudentExamAnalyticsResponse getMyAnalytics(String email) {
        User student = findStudent(email);

        List<ExamAttempt> attempts = attemptRepository
                .findByStudent_IdOrderByStartedAtDesc(student.getId());

        long totalAttempts = attempts.size();

        long submittedAttempts = attempts.stream()
                .filter(attempt -> attempt.getStatus() == AttemptStatus.SUBMITTED)
                .count();

        long inProgressAttempts = attempts.stream()
                .filter(attempt -> attempt.getStatus() == AttemptStatus.IN_PROGRESS)
                .count();

        List<Double> percentages = attempts.stream()
                .filter(attempt -> attempt.getStatus() == AttemptStatus.SUBMITTED)
                .filter(attempt -> attempt.getScore() != null)
                .filter(attempt -> attempt.getTotalMarks() != null
                        && attempt.getTotalMarks() > 0)
                .map(attempt -> attempt.getScore() * 100.0
                        / attempt.getTotalMarks())
                .toList();

        double averagePercentage = percentages.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        double bestPercentage = percentages.stream()
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0.0);

        return new StudentExamAnalyticsResponse(
                totalAttempts,
                submittedAttempts,
                inProgressAttempts,
                roundToTwoDecimals(averagePercentage),
                roundToTwoDecimals(bestPercentage));
    }

    public ExamAttemptResponse submitAttempt(
            Long attemptId,
            String email,
            ExamSubmissionRequest request) {

        User student = findStudent(email);

        ExamAttempt attempt = attemptRepository
                .findByIdAndStudent_Id(attemptId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Exam attempt not found"));

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This exam attempt has already been submitted");
        }

        List<ExamQuestion> questions =
                questionRepository.findByExam_IdOrderByQuestionOrderAsc(
                        attempt.getExam().getId());

        if (questions.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This exam does not have any questions");
        }

        int totalMarks = questions.stream()
                .mapToInt(ExamQuestion::getMarks)
                .sum();

        LocalDateTime deadline = attempt.getStartedAt()
                .plusMinutes(attempt.getExam().getDurationMinutes());

        LocalDateTime now = LocalDateTime.now();

        // If the exam has expired, finalize it without scoring late answers.
        if (!now.isBefore(deadline)) {
            attempt.setScore(0);
            attempt.setTotalMarks(totalMarks);
            attempt.setStatus(AttemptStatus.SUBMITTED);
            attempt.setSubmittedAt(now);

            return ExamAttemptResponse.from(attemptRepository.save(attempt));
        }

        if (request == null || request.answers() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Answers are required");
        }

        Set<Long> submittedQuestionIds = new HashSet<>();
        Map<Long, String> selectedOptions = new HashMap<>();

        for (AnswerSubmission answer : request.answers()) {
            if (answer == null
                    || answer.questionId() == null
                    || answer.selectedOption() == null
                    || answer.selectedOption().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Every answer must contain a question ID and selected option");
            }

            if (!submittedQuestionIds.add(answer.questionId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Duplicate answers for the same question are not allowed");
            }

            String selectedOption = answer.selectedOption()
                    .trim()
                    .toUpperCase(Locale.ROOT);

            if (!List.of("A", "B", "C", "D").contains(selectedOption)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected option must be A, B, C, or D");
            }

            selectedOptions.put(answer.questionId(), selectedOption);
        }

        Set<Long> examQuestionIds = new HashSet<>();

        for (ExamQuestion question : questions) {
            examQuestionIds.add(question.getId());
        }

        for (Long questionId : submittedQuestionIds) {
            if (!examQuestionIds.contains(questionId)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "An answer contains a question that does not belong to this exam");
            }
        }

        int score = 0;

        for (ExamQuestion question : questions) {
            String selectedOption = selectedOptions.get(question.getId());

            if (selectedOption != null
                    && selectedOption.equalsIgnoreCase(
                            question.getCorrectOption())) {
                score += question.getMarks();
            }
        }

        // Save one record per question, including unanswered questions.
        for (ExamQuestion question : questions) {
            ExamAttemptAnswer savedAnswer = new ExamAttemptAnswer();
            savedAnswer.setAttempt(attempt);
            savedAnswer.setQuestion(question);
            savedAnswer.setSelectedOption(
                    selectedOptions.get(question.getId()));

            answerRepository.save(savedAnswer);
        }

        attempt.setScore(score);
        attempt.setTotalMarks(totalMarks);
        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(now);

        return ExamAttemptResponse.from(attemptRepository.save(attempt));
    }

    @Transactional(readOnly = true)
    public ExamAttemptReviewResponse getMyAttemptReview(
            Long attemptId,
            String email) {

        User student = findStudent(email);

        ExamAttempt attempt = attemptRepository
                .findByIdAndStudent_Id(attemptId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Exam attempt not found"));

        if (attempt.getStatus() != AttemptStatus.SUBMITTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Review is available only after the exam has been submitted");
        }

        Map<Long, String> savedOptions = new HashMap<>();

        for (ExamAttemptAnswer answer :
                answerRepository.findByAttempt_Id(attemptId)) {
            savedOptions.put(
                    answer.getQuestion().getId(),
                    answer.getSelectedOption());
        }

        List<ExamQuestion> questions =
                questionRepository.findByExam_IdOrderByQuestionOrderAsc(
                        attempt.getExam().getId());

        List<ExamQuestionReviewResponse> reviewQuestions =
                questions.stream()
                        .map(question -> {
                            String selectedOption =
                                    savedOptions.get(question.getId());

                            String correctOption =
                                    question.getCorrectOption()
                                            .toUpperCase(Locale.ROOT);

                            String result;
                            int awardedMarks = 0;

                            if (selectedOption == null) {
                                result = "UNANSWERED";
                            } else if (selectedOption.equalsIgnoreCase(
                                    correctOption)) {
                                result = "CORRECT";
                                awardedMarks = question.getMarks();
                            } else {
                                result = "INCORRECT";
                            }

                            return new ExamQuestionReviewResponse(
                                    question.getId(),
                                    question.getQuestionOrder(),
                                    question.getQuestionText(),
                                    question.getOptionA(),
                                    question.getOptionB(),
                                    question.getOptionC(),
                                    question.getOptionD(),
                                    selectedOption,
                                    getOptionText(question, selectedOption),
                                    correctOption,
                                    getOptionText(question, correctOption),
                                    result,
                                    question.getMarks(),
                                    awardedMarks);
                        })
                        .toList();

        return new ExamAttemptReviewResponse(
                attempt.getId(),
                attempt.getExam().getTitle(),
                attempt.getStatus().name(),
                attempt.getScore(),
                attempt.getTotalMarks(),
                attempt.getSubmittedAt(),
                reviewQuestions);
    }

    @Transactional(readOnly = true)
    public List<ExamAttemptResponse> getAllAttempts() {
        return attemptRepository.findAll()
                .stream()
                .map(ExamAttemptResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExamAttemptResponse getAttemptById(Long attemptId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Exam attempt not found"));

        return ExamAttemptResponse.from(attempt);
    }

    private String getOptionText(
            ExamQuestion question,
            String option) {

        if (option == null) {
            return null;
        }

        return switch (option.toUpperCase(Locale.ROOT)) {
            case "A" -> question.getOptionA();
            case "B" -> question.getOptionB();
            case "C" -> question.getOptionC();
            case "D" -> question.getOptionD();
            default -> null;
        };
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private User findStudent(String email) {
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This account is inactive");
        }

        if (!"STUDENT".equals(user.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can perform this action");
        }

        return user;
    }

    private Exam findPublishedExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Exam not found"));

        if (!Boolean.TRUE.equals(exam.getPublished())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This exam is not published");
        }

        return exam;
    }
}
