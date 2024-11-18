package aoop.quicker.repository;

import aoop.quicker.model.Bed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface BedRepository extends JpaRepository<Bed, Integer>, JpaSpecificationExecutor<Bed> {
    Page<Bed> findAll(Pageable pageable);
    Optional<Bed> findBedByBedLocCodeAndBedStatusIs(String bedLocCode, String bedStatus);
}
