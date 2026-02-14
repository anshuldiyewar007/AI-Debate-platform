from pydantic import BaseModel
from typing import Optional, List


class Debate(BaseModel):
    id: Optional[str]
    topic: str
    participants: Optional[List[str]] = []
    created_by: Optional[str]
    content: Optional[str]


# TODO: Replace with a proper DB model/ODM mapping when implementing persistence
