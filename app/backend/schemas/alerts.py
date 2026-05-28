from pydantic import BaseModel


class AlertPreferencesResponse(BaseModel):
    email: str
    alert_trend_surge: bool
    alert_top10_entry: bool
    alert_new_pepite: bool


class AlertPreferencesUpdate(BaseModel):
    alert_trend_surge: bool
    alert_top10_entry: bool
    alert_new_pepite: bool


class TriggerAlertsRequest(BaseModel):
    alert_type: str  # "trend_surge" | "top10_entry" | "new_pepite"
    product_name: str
    product_id: str = ""
    secret: str
