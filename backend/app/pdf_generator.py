import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(data: dict, output_path: str):
    """
    Generates a premium executive property report using ReportLab.
    Applies a sleek luxury black-and-gold aesthetic.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom colors
    gold = colors.HexColor("#d4af37")
    dark_slate = colors.HexColor("#0b0c10")
    light_gold = colors.HexColor("#fdf9eb")
    text_dark = colors.HexColor("#1f2937")
    text_light = colors.HexColor("#ffffff")
    gray_border = colors.HexColor("#e5e7eb")
    gray_bg = colors.HexColor("#f9fafb")
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=gold,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#9ca3af"),
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=dark_slate,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_dark,
        spaceAfter=8
    )
    
    dna_style = ParagraphStyle(
        'DnaText',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=12,
        leading=16,
        textColor=gold,
        alignment=1 # Centered
    )

    badge_style = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=gold,
        alignment=1 # Centered
    )

    story = []
    
    # --- HEADER PANEL (Black & Gold) ---
    header_data = [
        [Paragraph("ESTATEGPT ELITE", title_style)],
        [Paragraph("EXECUTIVE REAL ESTATE VALUATION & INTELLIGENCE REPORT", subtitle_style)]
    ]
    header_table = Table(header_data, colWidths=[530])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), dark_slate),
        ('PADDING', (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,1), (-1,1), 20),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 15))
    
    # --- PROPERTY SPECIFICATIONS & DNA ---
    inputs = data.get("inputs", {})
    spec_data = [
        [
            Paragraph("<b>Area:</b>", body_style), Paragraph(f"{inputs.get('area')} sq.ft.", body_style),
            Paragraph("<b>Mansion DNA:</b>", body_style), Paragraph(f"<b>{data.get('house_dna')}</b>", dna_style)
        ],
        [
            Paragraph("<b>Bedrooms:</b>", body_style), Paragraph(str(inputs.get("bedrooms")), body_style),
            Paragraph("<b>Prestige Tier:</b>", body_style), Paragraph(f"{data.get('prestige_tier')}", body_style)
        ],
        [
            Paragraph("<b>Bathrooms:</b>", body_style), Paragraph(str(inputs.get("bathrooms")), body_style),
            Paragraph("<b>Prestige Badge:</b>", body_style), Paragraph(f"{data.get('prestige_badge')}", badge_style)
        ],
        [
            Paragraph("<b>Stories:</b>", body_style), Paragraph(str(inputs.get("stories")), body_style),
            Paragraph("<b>Luxury Grade:</b>", body_style), Paragraph(f"{data.get('luxury_grade')}", body_style)
        ],
        [
            Paragraph("<b>Parking Spaces:</b>", body_style), Paragraph(str(inputs.get("parking")), body_style),
            Paragraph("<b>Furnishing:</b>", body_style), Paragraph(str(inputs.get("furnishingstatus")).capitalize(), body_style)
        ],
        [
            Paragraph("<b>Climate Control:</b>", body_style), Paragraph("Air Conditioned" if str(inputs.get("airconditioning")).lower() in ("yes", "true", "1") else "None", body_style),
            Paragraph("<b>Preferred Area:</b>", body_style), Paragraph("Yes" if str(inputs.get("prefarea")).lower() in ("yes", "true", "1") else "No", body_style)
        ]
    ]
    
    spec_table = Table(spec_data, colWidths=[90, 160, 110, 170])
    spec_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, gray_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, gray_border),
        ('BACKGROUND', (0,0), (1,-1), gray_bg),
        ('BACKGROUND', (2,0), (2,-1), gray_bg),
        ('BACKGROUND', (3,0), (3,0), light_gold), # DNA highlight
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    
    story.append(Paragraph("PROPERTY CHARACTERISTICS & IDENTITY", h1_style))
    story.append(spec_table)
    story.append(Spacer(1, 15))
    
    # --- VALUATION & RANGE ---
    formatted_price = f"₹{data.get('predicted_price'):,.2f}"
    formatted_min = f"₹{data.get('price_min'):,.2f}"
    formatted_max = f"₹{data.get('price_max'):,.2f}"
    confidence_pct = f"{data.get('confidence_score') * 100:.1f}%"
    
    val_data = [
        [
            Paragraph("<b>VALUATION MODEL</b>", ParagraphStyle('ValTitle', parent=body_style, fontName='Helvetica-Bold', fontSize=10, textColor=dark_slate)),
            Paragraph("<b>PREDICTED FAIR PRICE</b>", ParagraphStyle('ValTitle2', parent=body_style, fontName='Helvetica-Bold', fontSize=10, textColor=dark_slate))
        ],
        [
            Paragraph(
                f"<b>Confidence:</b> {confidence_pct}<br/>"
                f"<b>Residual Error (RMSE):</b> ±₹{data.get('rmse', 950000):,.0f}<br/>"
                f"<b>Appraisal Model:</b> RandomForest Regression Ensemble", 
                body_style
            ),
            Paragraph(
                f"<font size=16 color='#d4af37'><b>{formatted_price}</b></font><br/>"
                f"<font size=9 color='#6b7280'>Prediction Range:<br/><b>{formatted_min} – {formatted_max}</b></font>", 
                body_style
            )
        ]
    ]
    
    val_table = Table(val_data, colWidths=[265, 265])
    val_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, gold),
        ('BACKGROUND', (0,0), (-1,0), light_gold),
        ('LINEBELOW', (0,0), (-1,0), 1, gold),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    
    story.append(Paragraph("AI VALUATION ANALYSIS", h1_style))
    story.append(val_table)
    story.append(Spacer(1, 15))
    
    # --- LUXURY & INVESTMENT SCORECARDS ---
    score_data = [
        [
            Paragraph("<b>Luxury Quotient Score:</b>", body_style), Paragraph(f"<b>{data.get('luxury_score')}/100</b>", body_style),
            Paragraph("<b>Investment Index:</b>", body_style), Paragraph(f"<b>{data.get('investment_score')}/100</b>", body_style)
        ],
        [
            Paragraph("<b>Mansion Prestige Index:</b>", body_style), Paragraph(f"<b>{data.get('prestige_score')}/100</b>", body_style),
            Paragraph("<b>Rental Yield Potential:</b>", body_style), Paragraph(f"<b>{data.get('rental_potential')}/100</b>", body_style)
        ],
        [
            Paragraph("<b>Smart Home Readiness:</b>", body_style), Paragraph(f"<b>{data.get('smart_home_score')}/100</b>", body_style),
            Paragraph("<b>Appreciation Score:</b>", body_style), Paragraph(f"<b>{data.get('appreciation_potential')}/100</b>", body_style)
        ],
        [
            Paragraph("<b>Green Luxury Rating:</b>", body_style), Paragraph(f"<b>{data.get('green_score')}/100</b>", body_style),
            Paragraph("<b>Wealth Preservation:</b>", body_style), Paragraph(f"<b>{data.get('wealth_preservation')}/100</b>", body_style)
        ]
    ]
    
    score_table = Table(score_data, colWidths=[150, 115, 150, 115])
    score_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, gray_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, gray_border),
        ('BACKGROUND', (0,0), (0,-1), gray_bg),
        ('BACKGROUND', (2,0), (2,-1), gray_bg),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    story.append(Paragraph("EXECUTIVE SCORECARD & PERFORMANCE METRICS", h1_style))
    story.append(score_table)
    story.append(Spacer(1, 15))
    
    # --- FUTURE VALUE FORECAST ---
    fc = data.get("forecast", {})
    forecast_data = [
        [Paragraph("<b>Period</b>", body_style), Paragraph("<b>Projected Valuation</b>", body_style), Paragraph("<b>Growth Yield (ROI)</b>", body_style)],
        [Paragraph("Current Valuation", body_style), Paragraph(f"₹{fc.get('current'):,.2f}", body_style), Paragraph("Base Price", body_style)],
        [Paragraph("1-Year Valuation", body_style), Paragraph(f"₹{fc.get('1_year'):,.2f}", body_style), Paragraph(f"+{fc.get('cagr_pct')}%", body_style)],
        [Paragraph("3-Year Valuation", body_style), Paragraph(f"₹{fc.get('3_year'):,.2f}", body_style), Paragraph(f"+{((fc.get('3_year')/fc.get('current')) - 1)*100:.1f}%", body_style)],
        [Paragraph("5-Year Valuation", body_style), Paragraph(f"₹{fc.get('5_year'):,.2f}", body_style), Paragraph(f"+{fc.get('roi_5_year_pct')}% total ROI", body_style)]
    ]
    
    forecast_table = Table(forecast_data, colWidths=[175, 175, 180])
    forecast_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, gray_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, gray_border),
        ('BACKGROUND', (0,0), (-1,0), gray_bg),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    story.append(Paragraph("5-YEAR FUTURE GROWTH PROJECTIONS", h1_style))
    story.append(forecast_table)
    story.append(Spacer(1, 15))
    
    # --- LIFESTYLE REPORT & EXPLANATION ---
    story.append(Paragraph("AI LIFESTYLE & VALUATION BRIEF", h1_style))
    story.append(Paragraph(data.get("lifestyle", ""), body_style))
    
    # Build Document
    doc.build(story)
