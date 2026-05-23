"""add done to cards

Revision ID: a1b2c3d4e5f6
Revises: 0b5521c463e2
Create Date: 2026-05-23 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '0b5521c463e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('cards', sa.Column('done', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('cards', 'done')
