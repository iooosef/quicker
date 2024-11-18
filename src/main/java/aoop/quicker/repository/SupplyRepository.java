package aoop.quicker.repository;

import aoop.quicker.model.Supply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SupplyRepository extends JpaRepository<Supply, Integer>, JpaSpecificationExecutor<Supply> {
    Page<Supply> findAll(Pageable pageable);
    boolean existsBySupplyName(String supplyName);
}