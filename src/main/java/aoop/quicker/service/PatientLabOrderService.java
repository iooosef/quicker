package aoop.quicker.service;

import aoop.quicker.model.PatientLabOrder;
import aoop.quicker.model.Supply;
import aoop.quicker.model.viewmodel.PatientLabOrderViewModel;
import aoop.quicker.repository.PatientLabOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Predicate;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PatientLabOrderService {
    final String DRIVER = "com.ms.sqlserver.jdbc.Driver";
    final String URL;

    private final PatientLabOrderRepository patientLabOrderRepository;
    private EntityManager entityManager;


    public PatientLabOrderService(PatientLabOrderRepository patientLabOrderRepository,
                                  EntityManager entityManager,
                                  @Value("${spring.datasource.url}") String url
                                  ) {
        this.patientLabOrderRepository = patientLabOrderRepository;
        this.entityManager = entityManager;
        this.URL = url;
    }

    public Page<PatientLabOrderViewModel> getAllPatientLabOrdersByAdmissionID(Integer id, Pageable pageable) {
        String queryString = "WITH CTE AS (" +
                             "   SELECT lab.patientLabsID, ROW_NUMBER() OVER (ORDER BY lab.patientLabsID) AS RowNum, " +
                                "      lab.admissionID, lab.supplyID, lab.labOrderedOn, lab.labResultStatus, sup.supplyName, sup.supplyType " +
                                "   FROM PatientLabOrders lab " +
                                "   JOIN Supplies sup ON lab.supplyID = sup.supplyID " +
                                "   WHERE lab.admissionID = ?" +
                                ") " +
                                "SELECT * FROM CTE WHERE RowNum BETWEEN ? AND ?";
//        PreparedStatement preparedStatement = entityManager.unwrap(org.hibernate.Session.class).connection().prepareStatement(queryString);

        int totalRecords = 0;
        List<PatientLabOrderViewModel> patientLabOrders = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DriverManager.getConnection(URL);
            ps = conn.prepareStatement(queryString);
            Pageable paged = pageable;
            int start = paged.getPageNumber() * paged.getPageSize() + 1;
            int end = start + paged.getPageSize() - 1;
            ps.setInt(1, id);
            ps.setInt(2, start);
            ps.setInt(3, end);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                PatientLabOrderViewModel patientLabOrder = new PatientLabOrderViewModel();
                patientLabOrder.setId(rs.getInt("patientLabsID"));
                patientLabOrder.setAdmissionID(rs.getInt("admissionID"));
                patientLabOrder.setSupplyID(rs.getInt("supplyID"));
                patientLabOrder.setLabOrderedOn(rs.getTimestamp("labOrderedOn").toInstant());
                patientLabOrder.setLabResultStatus(rs.getString("labResultStatus"));
                patientLabOrder.setSupplyName(rs.getString("supplyName"));
                patientLabOrder.setSupplyType(rs.getString("supplyType"));

                patientLabOrders.add(patientLabOrder);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        String countQueryString = "SELECT COUNT(*) FROM PatientLabOrders WHERE admissionID = ?";
        try (PreparedStatement psCount = conn.prepareStatement(countQueryString)) {
            psCount.setInt(1, id);
            try (ResultSet rs = psCount.executeQuery()) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    totalRecords = count;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        try {
            ps.close();
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return new PageImpl<PatientLabOrderViewModel>(patientLabOrders, pageable, totalRecords);

//        return patientLabOrderRepository.findAllByAdmissionID(id, pageable);
    }

    public Optional<PatientLabOrder> getPatientLabOrderByID(Integer id) {
        return patientLabOrderRepository.findById(id);
    }

    public Page<PatientLabOrder> searchPatientLabOrders(String query, Integer admissionID, Pageable pageable) {
        Specification<PatientLabOrder> specification = PatientLabOrderSpecification.buildSpecification(query, admissionID);
        return patientLabOrderRepository.findAll(specification, pageable);
    }

    public PatientLabOrder addPatientLabOrder(PatientLabOrder patientLabOrder) {
        return patientLabOrderRepository.save(patientLabOrder);
    }

    public PatientLabOrder updatePatientLabOrder(Integer id, PatientLabOrder patientLabOrder) {
        patientLabOrder.setAdmissionID(id);
        return patientLabOrderRepository.save(patientLabOrder);
    }

    /*
     * Inner class to build the Specification for the PatientLabOrder entity
     * This class is used to build the Predicate for the query
     * The Predicate is used to filter the results based on the query
     * The query can be a name, triage, status, bed location code, admit on, or out on
     * The query is split into terms, and each term is used to build a Predicate
     * The Predicates are then ANDed together to form the final Predicate
     * The final Predicate is used to filter the results
     */
    private class PatientLabOrderSpecification {
        public static Specification<PatientLabOrder> buildSpecification(String query, Integer admissionID) {
            return (root, criteriaQuery, criteriaBuilder) -> {
                if (query == null || query.isEmpty()) {
                    return null;
                }
                Predicate finalPredicate = null;

                // Enforce all results have the same AdmissionID
                if (admissionID != null && !admissionID.equals(0)) {
                    Predicate admissionIDPredicate = criteriaBuilder.equal(root.get("admissionID"), admissionID);
                    finalPredicate = admissionIDPredicate;
                }

                String[] terms = query.split("\\s+"); // Split query into terms
                for (String term : terms) {
                    Predicate predicate = null;
                    Predicate namePredicate = criteriaBuilder.like(root.get("name"), "%" + term + "%");
                    Join<PatientLabOrder, Supply> supplyJoin = root.join("supplyID", JoinType.INNER);
                    Predicate supplyNamePredicate = criteriaBuilder.like(supplyJoin.get("supplyName"), "%" + term + "%");
                    Predicate supplyTypePredicate = criteriaBuilder.like(supplyJoin.get("supplyType"), "test:%");
                    Predicate labResultStatusPredicate = criteriaBuilder.like(root.get("labResultStatus"), "%" + term + "%");
                    predicate = criteriaBuilder.or(namePredicate, supplyNamePredicate, supplyTypePredicate, labResultStatusPredicate);

                    if (finalPredicate == null) { // at first, finalPredicate is null, so we assign the first predicate
                        finalPredicate = predicate;
                    } else { // after the first predicate, we AND the predicates together
                        finalPredicate = criteriaBuilder.and(finalPredicate, predicate);
                    }
                }
                return finalPredicate;
            };
        }
    }

}
