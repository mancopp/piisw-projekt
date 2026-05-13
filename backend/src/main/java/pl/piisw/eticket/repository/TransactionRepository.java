package pl.piisw.eticket.repository;

import org.springframework.stereotype.Repository;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.model.Transaction;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class TransactionRepository {
    private final List<Transaction> transactions = new ArrayList<>();

    public Transaction save(Transaction transaction) {
        transaction.setId((long) (transactions.size() + 1));
        transactions.add(transaction);
        return transaction;
    }

    public List<Transaction> findAllByUser(AppUser user) {
        return transactions.stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
    }
}