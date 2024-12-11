package aoop.quicker.repository;

import aoop.quicker.model.Bed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import javax.persistence.criteria.Predicate;
import java.util.Arrays;
import java.util.Optional;

public interface BedRepository extends JpaRepository<Bed, Integer>, JpaSpecificationExecutor<Bed> {
    Page<Bed> findAll(Pageable pageable);
    Optional<Bed> findBedByBedLocCodeAndBedStatusIs(String bedLocCode, String bedStatus);
    default Page<Bed> findByKeywords(String[] keywords, Pageable pageable) {
        return findAll((root, query, criteriaBuilder) -> {
            Predicate[] predicates = Arrays.stream(keywords)
                    .map(keyword -> {
                        String pattern = "%" + keyword + "%";
                        return criteriaBuilder.or(
                                criteriaBuilder.like(root.get("bedLocCode"), pattern),
                                criteriaBuilder.like(root.get("bedStatus"), pattern)
                        );
                    })
                    .toArray(Predicate[]::new);
            query.orderBy(criteriaBuilder.desc(root.get("id")));
            return criteriaBuilder.or(predicates);
        }, pageable);
    }
}
