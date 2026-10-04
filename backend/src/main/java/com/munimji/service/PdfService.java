package com.munimji.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.munimji.dto.invoice.InvoiceItemResponse;
import com.munimji.dto.invoice.InvoiceResponse;
import com.munimji.util.AmountInWordsUtil;
import com.munimji.util.MoneyUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Builds the PDF tax invoice with OpenPDF.
 * Shop name and GSTIN come from application.properties.
 */
@Service
public class PdfService {

    @Value("${shop.name}")
    private String shopName;

    @Value("${shop.gstin}")
    private String shopGstin;

    @Value("${shop.address}")
    private String shopAddress;

    @Value("${shop.phone}")
    private String shopPhone;

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public byte[] generateInvoicePdf(InvoiceResponse invoice) {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font shopFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Shop header
            Paragraph shopNameLine = new Paragraph(shopName, titleFont);
            shopNameLine.setAlignment(Element.ALIGN_CENTER);
            document.add(shopNameLine);

            Paragraph addressLine = new Paragraph(shopAddress, shopFont);
            addressLine.setAlignment(Element.ALIGN_CENTER);
            document.add(addressLine);

            Paragraph gstinLine = new Paragraph("GSTIN: " + shopGstin + "  |  Phone: " + shopPhone, shopFont);
            gstinLine.setAlignment(Element.ALIGN_CENTER);
            document.add(gstinLine);

            document.add(new Paragraph(" ", normalFont));

            // Invoice title and number
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{50, 50});
            headerTable.addCell(leftCell("TAX INVOICE", headingFont));
            PdfPCell right = rightCell("", normalFont);
            right.addElement(new Phrase("Invoice No: " + invoice.getInvoiceNumber(), boldFont));
            right.addElement(new Phrase("Date: " + invoice.getInvoiceDate().format(DATE_TIME), normalFont));
            headerTable.addCell(right);
            document.add(headerTable);

            document.add(new Paragraph(" ", normalFont));

            // Customer details
            PdfPTable customerTable = new PdfPTable(2);
            customerTable.setWidthPercentage(100);
            customerTable.setWidths(new float[]{50, 50});
            customerTable.addCell(leftCell("Bill To", boldFont));
            String customer = invoice.getCustomerName() == null ? "Walk-in Customer" : invoice.getCustomerName();
            String phone = invoice.getCustomerPhone() == null ? "" : "  |  " + invoice.getCustomerPhone();
            customerTable.addCell(rightCell(customer + phone, normalFont));
            document.add(customerTable);

            document.add(new Paragraph(" ", normalFont));

            // Item table
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{5, 28, 12, 9, 12, 9, 25});

            String[] headers = {"#", "Item", "HSN", "Qty", "Rate", "GST %", "Amount"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, boldFont));
                cell.setBackgroundColor(new Color(230, 230, 230));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5f);
                table.addCell(cell);
            }

            int rowNumber = 1;
            for (InvoiceItemResponse item : invoice.getItems()) {
                table.addCell(centerCell(String.valueOf(rowNumber), normalFont));
                PdfPCell nameCell = new PdfPCell(new Phrase(item.getProductName(), normalFont));
                nameCell.setPadding(5f);
                table.addCell(nameCell);
                table.addCell(centerCell(nullSafe(item.getHsnCode()), normalFont));
                table.addCell(centerCell(String.valueOf(item.getQuantity()), normalFont));
                table.addCell(rightCellMoney(item.getUnitPrice(), normalFont));
                table.addCell(centerCell(item.getGstRate().stripTrailingZeros().toPlainString(), normalFont));
                table.addCell(rightCellMoney(item.getLineTotal(), normalFont));
                rowNumber++;
            }
            document.add(table);

            document.add(new Paragraph(" ", normalFont));

            // Totals on the right half of the page
            PdfPTable totals = new PdfPTable(2);
            totals.setWidthPercentage(50);
            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totals.setWidths(new float[]{60, 40});

            totals.addCell(leftCell("Subtotal", normalFont));
            totals.addCell(rightCellMoney(invoice.getSubTotal(), normalFont));
            totals.addCell(leftCell("Discount", normalFont));
            totals.addCell(rightCellMoney(invoice.getDiscountAmount(), normalFont));
            totals.addCell(leftCell("CGST", normalFont));
            totals.addCell(rightCellMoney(invoice.getCgstAmount(), normalFont));
            totals.addCell(leftCell("SGST", normalFont));
            totals.addCell(rightCellMoney(invoice.getSgstAmount(), normalFont));
            totals.addCell(leftCell("Grand Total", boldFont));
            totals.addCell(rightCellMoney(invoice.getGrandTotal(), boldFont));
            document.add(totals);

            document.add(new Paragraph(" ", normalFont));

            Paragraph words = new Paragraph("Amount in words: "
                    + AmountInWordsUtil.convert(invoice.getGrandTotal()), boldFont);
            document.add(words);

            document.add(new Paragraph(" ", normalFont));

            Paragraph footer = new Paragraph(
                    "Thank you for your business. Goods once sold will not be taken back without bill.",
                    smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            Paragraph generated = new Paragraph(
                    "This is a computer generated invoice by MunimJi.", smallFont);
            generated.setAlignment(Element.ALIGN_CENTER);
            document.add(generated);

            document.close();
            writer.close();
        } catch (DocumentException ex) {
            throw new IllegalStateException("Could not generate invoice PDF", ex);
        }

        return out.toByteArray();
    }

    private PdfPCell leftCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4f);
        return cell;
    }

    private PdfPCell rightCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(4f);
        return cell;
    }

    private PdfPCell centerCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5f);
        return cell;
    }

    private PdfPCell rightCellMoney(java.math.BigDecimal value, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(MoneyUtil.round(value).toPlainString(), font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(5f);
        return cell;
    }

    private String nullSafe(String value) {
        return value == null ? "-" : value;
    }
}
