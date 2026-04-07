import os
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT


TEMP_DIR = os.path.join(os.path.dirname(__file__), "..", "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# Brand colors
DARK_BLUE = colors.HexColor("#1E3A5F")
ACCENT_BLUE = colors.HexColor("#3B82F6")
LIGHT_GRAY = colors.HexColor("#F0F4FA")
MID_GRAY = colors.HexColor("#CBD5E1")
WHITE = colors.white
BLACK = colors.HexColor("#1A1A1A")


def _build_styles():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=DARK_BLUE,
        spaceAfter=4,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=2,
        alignment=TA_CENTER,
    )
    meta_style = ParagraphStyle(
        "MetaStyle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_RIGHT,
    )
    summary_style = ParagraphStyle(
        "SummaryStyle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=DARK_BLUE,
        fontName="Helvetica-Bold",
    )
    return title_style, subtitle_style, meta_style, summary_style


def generate_sales_pdf(sales_data: list[dict]) -> str:
    """
    Generate a formatted PDF sales report.
    Returns the absolute file path of the saved .pdf file.
    """
    file_name = f"sales_report_{uuid.uuid4().hex[:8]}.pdf"
    file_path = os.path.join(TEMP_DIR, file_name)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=landscape(A4),
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    title_style, subtitle_style, meta_style, summary_style = _build_styles()
    story = []

    # ── Header ──────────────────────────────────────────────────────────────
    story.append(Paragraph("Laptop IMS — Sales Report", title_style))
    story.append(Paragraph("Inventory Management System", subtitle_style))
    story.append(Paragraph(
        f"Generated: {datetime.now().strftime('%d %B %Y, %H:%M')}",
        meta_style
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT_BLUE, spaceAfter=10))

    # ── Summary stats ────────────────────────────────────────────────────────
    if sales_data:
        total_revenue = sum(float(r.get("line_total", 0)) for r in sales_data)
        total_orders = len({r.get("sale_id") for r in sales_data})
        total_items = sum(int(r.get("quantity", 0)) for r in sales_data)

        summary_data = [
            ["Total Orders", "Total Items Sold", "Total Revenue"],
            [str(total_orders), str(total_items), f"Rs {total_revenue:,.2f}"],
        ]
        summary_table = Table(summary_data, colWidths=[8 * cm, 8 * cm, 8 * cm])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DARK_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("BACKGROUND", (0, 1), (-1, 1), LIGHT_GRAY),
            ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 1), (-1, 1), 13),
            ("TEXTCOLOR", (0, 1), (-1, 1), DARK_BLUE),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, 1), [LIGHT_GRAY]),
            ("BOX", (0, 0), (-1, -1), 1, MID_GRAY),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.5 * cm))

    # ── Data table ───────────────────────────────────────────────────────────
    headers = ["Sale ID", "Date", "Customer", "Product", "Brand", "Qty", "Unit Price", "Line Total", "Staff", "Status"]
    col_widths = [1.8*cm, 3.5*cm, 4*cm, 5*cm, 3*cm, 1.5*cm, 3*cm, 3*cm, 3.5*cm, 2.5*cm]

    if not sales_data:
        table_data = [headers, ["No data available"] + [""] * (len(headers) - 1)]
    else:
        table_data = [headers]
        for row in sales_data:
            date_val = row.get("sale_date", "")
            if date_val:
                try:
                    date_val = datetime.fromisoformat(str(date_val)).strftime("%d-%m-%Y")
                except Exception:
                    date_val = str(date_val)[:10]

            table_data.append([
                str(row.get("sale_id", "")),
                date_val,
                str(row.get("customer_name", "N/A")),
                str(row.get("product_name", "")),
                str(row.get("brand", "")),
                str(row.get("quantity", "")),
                f"Rs {float(row.get('unit_price', 0)):,.2f}",
                f"Rs {float(row.get('line_total', 0)):,.2f}",
                str(row.get("staff_name", "")),
                str(row.get("status", "completed")),
            ])

    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        # Header
        ("BACKGROUND", (0, 0), (-1, 0), DARK_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        # Data rows
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("TEXTCOLOR", (0, 1), (-1, -1), BLACK),
        ("ALIGN", (0, 1), (-1, -1), "LEFT"),
        ("ALIGN", (5, 1), (7, -1), "RIGHT"),   # Qty, prices right-aligned
        # Alternating rows
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        # Grid
        ("BOX", (0, 0), (-1, -1), 1, MID_GRAY),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        # Padding
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))

    story.append(table)

    # ── Footer ───────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MID_GRAY))
    footer_style = ParagraphStyle(
        "Footer", parent=getSampleStyleSheet()["Normal"],
        fontSize=8, textColor=colors.HexColor("#94A3B8"), alignment=TA_CENTER
    )
    story.append(Paragraph("Laptop IMS · Confidential · For internal use only", footer_style))

    doc.build(story)
    return file_path
