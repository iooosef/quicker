package aoop.quicker.repository;

import aoop.quicker.model.Supply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface SupplyRepository extends JpaRepository<Supply, Integer>, JpaSpecificationExecutor<Supply> {
    Page<Supply> findAll(Pageable pageable);
    Optional<Supply> findSupplyBySupplyNameAndSupplyType(String supplyName, String supplyType);
    Optional<Supply> findSupplyBySupplyName(String supplyName);
    boolean existsBySupplyName(String supplyName);
    boolean existsSupplyBySupplyNameAndSupplyType(String supplyName, String supplyType);
}