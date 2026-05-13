package pl.piisw.eticket.repository;

import org.springframework.stereotype.Repository;
import pl.piisw.eticket.model.AppUser;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final List<AppUser> users = new ArrayList<>();

    public Optional<AppUser> findByEmail(String email) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }

    public void save(AppUser user) {
        user.setId((long) (users.size() + 1));
        users.add(user);
    }
}