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
    final String DRIVER = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
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

    public Page<PatientLabOrderViewModel> searchPatientLabOrders(String query, Integer admissionID, Pageable pageable) {
        String queryString = "WITH CITE AS (" +
                "   SELECT lab.patientLabsID, ROW_NUMBER() OVER (ORDER BY lab.patientLabsID) AS RowNum, " +
                "      lab.admissionID, lab.supplyID, lab.labOrderedOn, lab.labResultStatus, sup.supplyName, sup.supplyType" +
                "   FROM PatientLabOrders lab " +
                "   JOIN Supplies sup ON lab.supplyID = sup.supplyID " +
                "   WHERE lab.admissionID = ?" +
                "   AND sup.supplyType LIKE 'test:%'" +
                "   AND (";
        List<String> likeClauses = new ArrayList<String>();

        String[] terms = query.split("\\s+"); // Split query into terms
        for (String term : terms) {
            likeClauses.add("sup.supplyName LIKE ? " +
                    "OR sup.supplyType LIKE ? " +
                    "OR lab.labResultStatus LIKE ?");
        }
        queryString += String.join(" OR ", likeClauses) + ")" +
                ") " +
                "SELECT * FROM CITE WHERE RowNum BETWEEN ? AND ?";

        int totalRecords = 0;
        List<PatientLabOrderViewModel> patientLabOrders = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(this.URL);
            PreparedStatement ps = conn.prepareStatement(queryString)) {
            ps.setInt(1, admissionID);

            int paramIndex = 2;
            for (String term : terms) {
                ps.setString(paramIndex++, "%" + term + "%");
                ps.setString(paramIndex++, "%" + term + "%");
                ps.setString(paramIndex++, "%" + term + "%");
            }

            int start = pageable.getPageNumber() * pageable.getPageSize() + 1;
            int end = start + pageable.getPageSize() - 1;
            ps.setInt(paramIndex++, start);
            ps.setInt(paramIndex++, end);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                PatientLabOrderViewModel order = new PatientLabOrderViewModel();
                order.setId(rs.getInt("patientLabsID"));
                order.setAdmissionID(rs.getInt("admissionID"));
                order.setSupplyID(rs.getInt("supplyID"));
                order.setSupplyName(rs.getString("supplyName"));
                order.setSupplyType(rs.getString("supplyType"));
                order.setLabOrderedOn(rs.getTimestamp("labOrderedOn").toInstant());
                order.setLabResultStatus(rs.getString("labResultStatus"));
                patientLabOrders.add(order);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return new PageImpl<>(patientLabOrders, pageable, totalRecords);
    }
    public PatientLabOrder addPatientLabOrder(PatientLabOrder patientLabOrder) {
        return patientLabOrderRepository.save(patientLabOrder);
    }

    public PatientLabOrder updatePatientLabOrder(Integer id, PatientLabOrder patientLabOrder) {
        patientLabOrder.setId(id);
        return patientLabOrderRepository.save(patientLabOrder);
    }

}
