package pl.piisw.eticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.model.Transaction;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByUserOrderByCreatedAtDesc(AppUser user);
}
