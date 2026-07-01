from sqlalchemy.orm import Session

from app.models.report import ReportSummary


def create_report_summary(db: Session, report: ReportSummary):
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_user_report_summaries(db: Session, user_id: int):
    return (
        db.query(ReportSummary)
        .filter(ReportSummary.user_id == user_id)
        .order_by(ReportSummary.created_at.desc())
        .all()
    )