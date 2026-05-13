package pl.piisw.eticket.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.piisw.eticket.dto.TransactionResponse;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.service.TransactionService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/my")
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(transactionService.getMyTransactions(user));
    }
}