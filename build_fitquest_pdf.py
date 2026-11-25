import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

# FitQuest Brand Colors
BRAND_DARK = colors.HexColor("#0B0F19")
BRAND_CARD = colors.HexColor("#111827")
BRAND_PRIMARY = colors.HexColor("#059669")  # Emerald/Lime
BRAND_ACCENT = colors.HexColor("#10B981")
BRAND_BLUE = colors.HexColor("#0284C7")
BRAND_MUTED = colors.HexColor("#64748B")
BRAND_LIGHT_BG = colors.HexColor("#F8FAFC")
BRAND_BORDER = colors.HexColor("#CBD5E1")
TEXT_DARK = colors.HexColor("#0F172A")
TEXT_MUTED = colors.HexColor("#475569")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        if self._pageNumber == 1:
            # Clean cover page without header/footer lines
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(BRAND_DARK)

        # Top Header line
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.8)
        self.line(36, 565, 805, 565)

        self.drawString(36, 572, "FitQuest – Gamification of Physical Fitness")
        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)
        self.drawRightString(805, 572, "Comprehensive UI & User Navigation Architecture Manual")

        # Bottom Footer line
        self.line(36, 30, 805, 30)
        self.drawString(36, 18, "Confidential & Proprietary • FitQuest Social Fitness Gamification Platform")
        self.setFont("Helvetica-Bold", 8)
        self.drawRightString(805, 18, f"Page {self._pageNumber} of {total_pages}")
        self.restoreState()


def build_pdf():
    pdf_filename = "FitQuest_UI_Navigation_Guide.pdf"
    workspace_dir = r"C:\Users\shyam pote\Desktop\Gamification_of_Physical_fitness"
    output_pdf_path = os.path.join(workspace_dir, pdf_filename)
    screenshots_dir = os.path.join(workspace_dir, "screenshots")

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=landscape(A4),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    cover_title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=BRAND_DARK,
        spaceAfter=5
    )

    cover_subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=TEXT_MUTED,
        spaceAfter=12
    )

    section_heading_style = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=BRAND_DARK,
        spaceAfter=3
    )

    detail_line_style = ParagraphStyle(
        'DetailLine',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=TEXT_DARK
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=TEXT_MUTED
    )

    story = []

    # ================= PAGE 1: COVER & EXECUTIVE OVERVIEW =================
    story.append(Spacer(1, 10))
    story.append(Paragraph("FITQUEST PLATFORM SPECIFICATION • UI NAVIGATION & WORKFLOW MANUAL", ParagraphStyle(
        'Tag', fontName='Helvetica-Bold', fontSize=8.5, textColor=BRAND_ACCENT, spaceAfter=4
    )))
    story.append(Paragraph("FitQuest: Gamification of Physical Fitness", cover_title_style))
    story.append(Paragraph("Complete User Interface Navigation, Feature Workflows & Screen-by-Screen Reference", cover_subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_ACCENT, spaceAfter=10))

    exec_html = """
    <b>Executive Overview:</b><br/>
    <b>FitQuest</b> is a production-grade social fitness platform that transforms routine physical workouts into an engaging RPG-style progression.
    The system couples scientific ACSM-standard Metabolic Equivalent of Task (MET) caloric computations with exponential XP progression curves
    (<code>XP = 100 × level²</code>), streak multipliers, tiered milestone badges, interactive quest boards, competitive leaderboards,
    and a community social feed.
    <br/><br/>
    <b>Documentation Scope:</b><br/>
    This document presents the visual UI navigation flows for all 13 core screens across both athlete and administrator roles.
    In accordance with system specifications, each interface screenshot is preceded by a prominent descriptive detail line outlining
    the navigation purpose, authentication tier, and gamification interactions.
    """
    exec_table = Table([[Paragraph(exec_html, ParagraphStyle('ExecP', fontName='Helvetica', fontSize=9, leading=13, textColor=TEXT_DARK))]], colWidths=[765])
    exec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(exec_table)

    story.append(Spacer(1, 10))

    # Architecture Overview Cards
    arch_specs = [
        [
            Paragraph("<b>Frontend Framework:</b> React 19 + TypeScript + Tailwind CSS", meta_style),
            Paragraph("<b>Backend Architecture:</b> Python FastAPI (Asynchronous REST)", meta_style)
        ],
        [
            Paragraph("<b>Data Persistence:</b> SQLAlchemy ORM + SQLite (Production MySQL Ready)", meta_style),
            Paragraph("<b>Authentication:</b> OAuth2 JWT Tokens with Role-Based Access Control", meta_style)
        ],
        [
            Paragraph("<b>Calorie Scientific Model:</b> ACSM Metabolic Equivalent of Task (MET)", meta_style),
            Paragraph("<b>Gamification Engine:</b> XP Levels, Streaks, FitCoins, 10 Milestone Badges", meta_style)
        ],
        [
            Paragraph("<b>Interactive Charts:</b> Recharts Data Visualizations & Trend Analytics", meta_style),
            Paragraph("<b>Social Engine:</b> Community Auto-Publishing, Kudos & Activity Comments", meta_style)
        ]
    ]
    arch_table = Table(arch_specs, colWidths=[380, 385])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(arch_table)

    story.append(PageBreak())

    # ================= PAGE 2: TABLE OF CONTENTS & DEMO ACCOUNTS =================
    story.append(Spacer(1, 5))
    story.append(Paragraph("System Navigation Architecture & Feature Index", section_heading_style))
    story.append(Paragraph("Detailed map of all platform routes, access boundaries, and gamification interactions.", cover_subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_ACCENT, spaceAfter=8))

    nav_map_data = [
        ["#", "Screen / Route", "Access Role", "Primary Gamification Mechanisms", "Doc Location"],
        ["01", "Landing Page (/)", "Public / Guest", "Value proposition, RPG progression showcase, tier roadmap", "Page 3"],
        ["02", "User Login Page (/login)", "Public / Guest", "JWT session generation, 1-click demo athlete quick-switch", "Page 4"],
        ["03", "User Registration (/register)", "Public / Guest", "Athlete onboarding, initial goals, character class init", "Page 5"],
        ["04", "Forgot Password (/forgot-password)", "Public / Guest", "Self-service credential recovery & security token reset", "Page 6"],
        ["05", "Athlete Dashboard (/dashboard)", "Athlete", "Real-time level progress, XP bar, streaks, FitCoins, recent logs", "Page 7"],
        ["06", "Activities Log (/activities)", "Athlete", "Historical workout archive, MET energy metrics, XP breakdown", "Page 8"],
        ["07", "Log Activity Modal (Overlay)", "Athlete", "ACSM MET calorie calculator, dynamic XP/coin multipliers", "Page 9"],
        ["08", "Quests & Rewards (/challenges)", "Athlete", "Daily/weekly quests, reward vaults, FitCoin & XP claiming", "Page 10"],
        ["09", "Leaderboards (/leaderboard)", "Athlete", "Global Arena podium (1st-3rd), Friends League, time filters", "Page 11"],
        ["10", "Community Feed (/community)", "Athlete", "Social workout auto-broadcasting, peer kudos, comments", "Page 12"],
        ["11", "Analytics Suite (/analytics)", "Athlete", "Recharts XP progression curves, weekly volume radar charts", "Page 13"],
        ["12", "Profile & Badges (/profile)", "Athlete", "10 tiered milestone badges (Bronze-Diamond), lifetime stats", "Page 14"],
        ["13", "Admin Center (/admin)", "Admin", "User administration, quest creation, community moderation", "Page 15"]
    ]

    nav_table_rows = []
    for r_idx, r in enumerate(nav_map_data):
        row_cells = []
        for c_idx, cell in enumerate(r):
            f_style = ParagraphStyle(
                f'NavCell_{r_idx}_{c_idx}',
                fontName='Helvetica-Bold' if (r_idx == 0 or c_idx == 0) else 'Helvetica',
                fontSize=7.5,
                leading=9.5,
                textColor=colors.white if r_idx == 0 else (BRAND_BLUE if c_idx == 4 else TEXT_DARK)
            )
            row_cells.append(Paragraph(cell, f_style))
        nav_table_rows.append(row_cells)

    nav_table = Table(nav_table_rows, colWidths=[20, 160, 85, 420, 80])
    nav_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_DARK),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#F8FAFC"), colors.HexColor("#FFFFFF")]),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (-1, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(nav_table)

    story.append(Spacer(1, 8))

    # Pre-seeded test accounts
    accounts_title = Paragraph("<b>Pre-Configured Demo Accounts for Instant Navigation Verification:</b>", ParagraphStyle('AccH', fontName='Helvetica-Bold', fontSize=8.5, textColor=BRAND_DARK, spaceAfter=4))
    story.append(accounts_title)

    acc_data = [
        ["User Profile", "Email Address", "Default Password", "Role", "Gamification Level / Archetype"],
        ["Alex Rivers", "alex@fitquest.com", "AlexPass123!", "Athlete", "Level 8 • Hybrid Runner / Cyclist (Active Streak)"],
        ["Sarah Chen", "sarah@fitquest.com", "SarahPass123!", "Athlete", "Level 9 • Marathoner (14-Day Streak Leader)"],
        ["Marcus Vance", "marcus@fitquest.com", "MarcusPass123!", "Athlete", "Level 5 • Strength & Powerlifter"],
        ["FitQuest Admin", "admin@fitquest.com", "AdminPass123!", "Admin", "System Administrator & Content Moderator"]
    ]
    acc_table_rows = []
    for row_idx, r in enumerate(acc_data):
        row_cells = []
        for cell in r:
            f_style = ParagraphStyle(
                f'AccCell_{row_idx}',
                fontName='Helvetica-Bold' if row_idx == 0 else 'Helvetica',
                fontSize=7.5,
                leading=9.5,
                textColor=colors.white if row_idx == 0 else TEXT_DARK
            )
            row_cells.append(Paragraph(cell, f_style))
        acc_table_rows.append(row_cells)

    acc_table = Table(acc_table_rows, colWidths=[105, 135, 95, 70, 360])
    acc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_DARK),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#F8FAFC"), colors.HexColor("#FFFFFF")]),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(acc_table)

    story.append(PageBreak())

    # ================= 13 SCREEN PAGES =================
    screens = [
        {
            "id": "01",
            "file": "01_landing_page.png",
            "title": "Public Landing & Gamification Showcase",
            "route": "/",
            "access": "Public / Unauthenticated",
            "detail_line": "Landing Page: Public portal showcasing the FitQuest gamification philosophy, RPG level progression tiers, dynamic feature showcases, and primary onboarding call-to-actions for new athletes."
        },
        {
            "id": "02",
            "file": "02_user_login_page.png",
            "title": "User Login Page (Authentication Gateway)",
            "route": "/login",
            "access": "Public / Guest",
            "detail_line": "User Login Page: Secure dual-credential authentication portal featuring JWT session management, password visibility toggles, and one-click quick-switch demo accounts (Alex, Sarah, Marcus, Admin)."
        },
        {
            "id": "03",
            "file": "03_user_registration_page.png",
            "title": "User Registration & Athlete Onboarding Page",
            "route": "/register",
            "access": "Public / Guest",
            "detail_line": "User Registration Page: Athlete onboarding flow collecting account credentials, personal fitness parameters, initial goal selection, and character class initialization."
        },
        {
            "id": "04",
            "file": "04_forgot_password_page.png",
            "title": "Forgot Password & Account Recovery Portal",
            "route": "/forgot-password",
            "access": "Public / Guest",
            "detail_line": "Forgot Password Page: Self-service credential recovery workflow providing secure token verification and reset instructions for locked athlete accounts."
        },
        {
            "id": "05",
            "file": "05_athlete_dashboard.png",
            "title": "Athlete Command Dashboard (Core Cockpit)",
            "route": "/dashboard",
            "access": "Authenticated Athlete",
            "detail_line": "Athlete Dashboard: Central gamified cockpit displaying real-time level progress, current XP vs. target curve, daily streak flame multipliers, FitCoins coin pouch, recent workouts, and active challenge shortcuts."
        },
        {
            "id": "06",
            "file": "06_activities_page.png",
            "title": "Workout Activities Log & History Page",
            "route": "/activities",
            "access": "Authenticated Athlete",
            "detail_line": "Activities History Page: Complete historical workout archive displaying categorized activities, duration, distance, scientific MET energy expenditure, XP earned, and filterable time horizons."
        },
        {
            "id": "07",
            "file": "07_log_activity_modal.png",
            "title": "Interactive Workout Logging & MET Calculator Modal",
            "route": "/activities (Modal Overlay)",
            "access": "Authenticated Athlete",
            "detail_line": "Log Activity Modal: Real-time workout entry form calculating ACSM Metabolic Equivalent of Task (MET) calories, dynamic XP multipliers, and FitCoin yields based on duration, distance, and chosen intensity."
        },
        {
            "id": "08",
            "file": "08_challenges_rewards_page.png",
            "title": "Challenges, Quests & Reward Redemption Page",
            "route": "/challenges",
            "access": "Authenticated Athlete",
            "detail_line": "Challenges & Rewards Page: Daily sprint blitzes, weekly endurance quests, and special gym challenges featuring automated progress tracking, reward vaults, and one-click FitCoin and XP claiming."
        },
        {
            "id": "09",
            "file": "09_leaderboard_page.png",
            "title": "Competitive Leaderboard & Global Podium",
            "route": "/leaderboard",
            "access": "Authenticated Athlete",
            "detail_line": "Competitive Leaderboard Page: Dual competitive arena hosting the Global Championship Podium (1st, 2nd, 3rd) and Friends League rankings with all-time, 30-day, and 7-day competitive filters."
        },
        {
            "id": "10",
            "file": "10_community_social_feed.png",
            "title": "Social Community Feed & Peer Interaction",
            "route": "/community",
            "access": "Authenticated Athlete",
            "detail_line": "Social Community Page: Interactive social fitness stream broadcasting automated athlete workout achievements, peer kudos endorsements, comments, and community athlete discovery."
        },
        {
            "id": "11",
            "file": "11_analytics_page.png",
            "title": "Performance Analytics & Visualization Suite",
            "route": "/analytics",
            "access": "Authenticated Athlete",
            "detail_line": "Performance Analytics Page: Data intelligence dashboard featuring interactive Recharts visualization: XP progression trends, weekly workout volume radar, and calorie expenditure breakdowns."
        },
        {
            "id": "12",
            "file": "12_user_profile_badges.png",
            "title": "Athlete Profile & 10-Tier Achievement Badges",
            "route": "/profile",
            "access": "Authenticated Athlete",
            "detail_line": "User Profile & Badges Page: Comprehensive athlete trophy cabinet showcasing 10 tiered milestone achievement badges (Bronze, Silver, Gold, Diamond), lifetime fitness statistics, and account settings."
        },
        {
            "id": "13",
            "file": "13_admin_control_center.png",
            "title": "Admin Control Center & System Operations",
            "route": "/admin",
            "access": "System Administrator",
            "detail_line": "Admin Control Center: Administrative governance portal providing system-wide user management, community post moderation, custom quest creation, and real-time backend operational health metrics."
        }
    ]

    img_width = 600
    img_height = 360

    for i, s in enumerate(screens):
        img_path = os.path.join(screenshots_dir, s["file"])
        if not os.path.exists(img_path):
            print(f"Warning: image {img_path} not found!")
            continue

        # Header block
        screen_num_title = f"{s['id']}. {s['title']}"
        story.append(Paragraph(screen_num_title, section_heading_style))

        # Detail In Line Callout Box
        detail_html = f"<b>Detail in Line:</b> <font color='#047857'><b>{s['detail_line']}</b></font>"
        detail_para = Paragraph(detail_html, detail_line_style)

        meta_info = f"<b>Route:</b> <font color='#0284C7'>{s['route']}</font> &nbsp;&nbsp;|&nbsp;&nbsp; <b>Access Level:</b> {s['access']}"
        meta_para = Paragraph(meta_info, ParagraphStyle('MTag', fontName='Helvetica-Bold', fontSize=7.5, leading=9, textColor=BRAND_PRIMARY))

        info_table = Table([[detail_para], [meta_para]], colWidths=[765])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
            ('BOX', (0, 0), (-1, -1), 0.6, colors.HexColor("#CBD5E1")),
            ('LINELEFT', (0, 0), (0, -1), 3, BRAND_ACCENT),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 4))

        # Screenshot Frame
        rl_img = RLImage(img_path, width=img_width, height=img_height)
        img_table = Table([[rl_img]], colWidths=[765])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0B0F19")),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#1E293B")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(img_table)

        if i < len(screens) - 1:
            story.append(PageBreak())

    print(f"Compiling document at: {output_pdf_path}...")
    doc.build(story, canvasmaker=NumberedCanvas)
    print("Compilation finished successfully!")
    return output_pdf_path

if __name__ == "__main__":
    build_pdf()
