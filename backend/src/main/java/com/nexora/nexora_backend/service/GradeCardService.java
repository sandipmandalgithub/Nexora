
package com.nexora.nexora_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nexora.nexora_backend.dto.GradeCardResponse;
import com.nexora.nexora_backend.entity.GradeCard;
import com.nexora.nexora_backend.entity.User;
import com.nexora.nexora_backend.repository.GradeCardRepository;

@Service
@Transactional(readOnly = true)
public class GradeCardService {

    private final GradeCardRepository gradeCardRepository;
    private final UserService userService;

    public GradeCardService(
            GradeCardRepository gradeCardRepository,
            UserService userService) {
        this.gradeCardRepository = gradeCardRepository;
        this.userService = userService;
    }

    public List<GradeCardResponse> getMyGradeCards(String email) {

        User student = findStudent(email);

        return gradeCardRepository
                .findByStudent_IdOrderByIssuedAtDesc(student.getId())
                .stream()
                .map(GradeCardResponse::from)
                .toList();
    }

    public GradeCardResponse getMyGradeCard(
            Long gradeCardId,
            String email) {

        User student = findStudent(email);

        GradeCard gradeCard = gradeCardRepository
                .findByIdAndStudent_Id(gradeCardId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Grade card not found"
                ));

        return GradeCardResponse.from(gradeCard);
    }

    public List<GradeCardResponse> getAllGradeCards() {

        return gradeCardRepository
                .findAllByOrderByIssuedAtDesc()
                .stream()
                .map(GradeCardResponse::from)
                .toList();
    }

    public GradeCard getGradeCardForStudentPdf(
            Long gradeCardId,
            String email) {

        User student = findStudent(email);

        return gradeCardRepository
                .findByIdAndStudent_Id(gradeCardId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Grade card not found"
                ));
    }

    public GradeCard getGradeCardForAdminPdf(Long gradeCardId) {

        return gradeCardRepository.findById(gradeCardId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Grade card not found"
                ));
    }

    private User findStudent(String email) {

        return userService.getUserByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student account not found"
                ));
    }
}
