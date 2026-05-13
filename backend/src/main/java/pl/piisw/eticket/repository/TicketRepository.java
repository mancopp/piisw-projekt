package pl.piisw.eticket.repository;

import org.springframework.stereotype.Repository;
import pl.piisw.eticket.model.AppUser;
import pl.piisw.eticket.model.Ticket;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class TicketRepository {
    private final List<Ticket> tickets = new ArrayList<>();

    public Ticket save(Ticket ticket) {
        ticket.setId((long) (tickets.size() + 1));
        tickets.add(ticket);
        return ticket;
    }

    public List<Ticket> findAllByUser(AppUser user) {
        return tickets.stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
    }
}