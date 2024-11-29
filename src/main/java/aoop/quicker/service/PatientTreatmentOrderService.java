package aoop.quicker.service;

import aoop.quicker.model.PatientTreatmentOrder;
import aoop.quicker.model.viewmodel.PatientTreatmentOrderViewModel;
import aoop.quicker.repository.PatientTreatmentOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PatientTreatmentOrderService {
    final String DRIVER = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
    final String URL;

    private final PatientTreatmentOrderRepository patientTreatmentOrderRepository;
    private EntityManager entityManager;

    public PatientTreatmentOrderService(PatientTreatmentOrderRepository patientTreatmentOrderRepository,
                                        EntityManager entityManager,
                                        @Value("${spring.datasource.url}") String url
                                        ) {
        this.patientTreatmentOrderRepository = patientTreatmentOrderRepository;
        this.entityManager = entityManager;
        this.URL = url;
    }

    public Page<PatientTreatmentOrderViewModel> getAllPatientTreatmentOrdersByAdmissionID(Integer id, Pageable pageable) {
        String queryString = "WITH CTE AS(" +
                                "      SELECT t.patientTreatmentsID, ROW_NUMBER() OVER (ORDER BY t.patientTreatmentsID) AS RowNum, " +
                                "          t.admissionID, t.supplyID, t.treatmentOrderedOn, s.supplyName " +
                                "      FROM PatientTreatmentOrders t " +
                                "      JOIN Supplies s ON t.supplyID = s.supplyID " +
                                "      WHERE t.admissionID = ?" +
                                ") " +
                                "SELECT * FROM CTE WHERE RowNum BETWEEN ? AND ?";
        int totalRecords = 0;
        List<PatientTreatmentOrderViewModel> patientTreatmentOrders = new ArrayList<>();
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
                PatientTreatmentOrderViewModel patientTreatmentOrder = new PatientTreatmentOrderViewModel();
                patientTreatmentOrder.setId(rs.getInt("patientTreatmentsID"));
                patientTreatmentOrder.setAdmissionID(rs.getInt("admissionID"));
                patientTreatmentOrder.setSupplyID(rs.getInt("supplyID"));
                patientTreatmentOrder.setSupplyName(rs.getString("supplyName"));
                patientTreatmentOrder.setTreatmentOrderedOn(rs.getTimestamp("treatmentOrderedOn").toInstant());
                patientTreatmentOrders.add(patientTreatmentOrder);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        String countQuery = "SELECT COUNT(*) AS totalRecords FROM PatientTreatmentOrders WHERE admissionID = ?";
        try (PreparedStatement psCount = conn.prepareStatement(countQuery)) {
            psCount.setInt(1, id);
            ResultSet rs = psCount.executeQuery();
            if (rs.next()) {
                totalRecords = rs.getInt("totalRecords");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        try {
            ps.close();
            conn.close();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return new PageImpl<PatientTreatmentOrderViewModel>(patientTreatmentOrders, pageable, totalRecords);
    }

    public Optional<PatientTreatmentOrder> getPatientTreatmentOrderByID(Integer id) {
        return patientTreatmentOrderRepository.findById(id);
    }

    public Page<PatientTreatmentOrderViewModel> searchPatientTreatmentOrders(String query, Integer admissionID, Pageable pageable) {
        String queryString = "WITH CTE AS(" +
                "   SELECT t.patientTreatmentsID, ROW_NUMBER() OVER (ORDER BY t.patientTreatmentsID) AS RowNum," +
                "      t.admissionID, t.supplyID, t.treatmentOrderedOn, s.supplyName" +
                "   FROM PatientTreatmentOrders t" +
                "   JOIN Supplies s ON t.supplyID = s.supplyID" +
                "   WHERE t.admissionID = ?" +
                "   AND s.supplyType LIKE 'treatment:%'" +
                "   AND (";
        List<String> likeClauses = new ArrayList<String>();

        String[] terms = query.split("\\s+"); // Split query into terms
        for (String term : terms) {
            likeClauses.add("s.supplyName LIKE ?");
        }
        queryString += String.join(" OR ", likeClauses) + ")" +
                ") " +
                "SELECT * FROM CTE WHERE RowNum BETWEEN ? AND ?";

        int totalRecords = 0;
        List<PatientTreatmentOrderViewModel> patientTreatmentOrders = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(this.URL);
            PreparedStatement ps = conn.prepareStatement(queryString)) {
            ps.setInt(1, admissionID);

            int paramIndex = 2;
            for (String term : terms) {
                ps.setString(paramIndex++, "%" + term + "%");
            }

            int start = pageable.getPageNumber() * pageable.getPageSize() + 1;
            int end = start + pageable.getPageSize() - 1;
            ps.setInt(paramIndex++, start);
            ps.setInt(paramIndex++, end);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                PatientTreatmentOrderViewModel entry = new PatientTreatmentOrderViewModel();
                entry.setId(rs.getInt("patientTreatmentsID"));
                entry.setAdmissionID(rs.getInt("admissionID"));
                entry.setSupplyID(rs.getInt("supplyID"));
                entry.setSupplyName(rs.getString("supplyName"));
                entry.setTreatmentOrderedOn(rs.getTimestamp("treatmentOrderedOn").toInstant());
                patientTreatmentOrders.add(entry);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return new PageImpl<>(patientTreatmentOrders, pageable, totalRecords);
    }

    public PatientTreatmentOrder addPatientTreatmentOrder(PatientTreatmentOrder patientTreatmentOrder) {
        return patientTreatmentOrderRepository.save(patientTreatmentOrder);
    }

    public PatientTreatmentOrder updatePatientTreatmentOrder(Integer id, PatientTreatmentOrder patientTreatmentOrder) {
        patientTreatmentOrder.setId(id);
        return patientTreatmentOrderRepository.save(patientTreatmentOrder);
    }

}
