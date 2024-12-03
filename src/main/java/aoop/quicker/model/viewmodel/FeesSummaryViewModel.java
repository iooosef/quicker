package aoop.quicker.model.viewmodel;

import java.math.BigDecimal;

public class FeesSummaryViewModel {
    private String feeDetails;
    private BigDecimal feeCharge;
    private BigDecimal feeDiscount;
    private BigDecimal feeTotal;

    public String getFeeDetails() {
        return feeDetails;
    }

    public void setFeeDetails(String feeDetails) {
        this.feeDetails = feeDetails;
    }

    public BigDecimal getFeeCharge() {
        return feeCharge;
    }

    public void setFeeCharge(BigDecimal feeCharge) {
        this.feeCharge = feeCharge;
    }

    public BigDecimal getFeeDiscount() {
        return feeDiscount;
    }

    public void setFeeDiscount(BigDecimal feeDiscount) {
        this.feeDiscount = feeDiscount;
    }

    public BigDecimal getFeeTotal() {
        return feeTotal;
    }

    public void setFeeTotal(BigDecimal feeTotal) {
        this.feeTotal = feeTotal;
    }
}
