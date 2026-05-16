package pl.piisw.eticket.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.piisw.eticket.dto.TransactionResponse;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.repository.TransactionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<TransactionResponse> getMyTransactions(AppUser user) {
        return transactionRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(tx -> TransactionResponse.builder()
                        .id(tx.getId())
                        .ticketId(tx.getTicket().getId())
                        .amount(tx.getAmount())
                        .currency(tx.getCurrency())
                        .status(tx.getStatus())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .toList();
    }
}
