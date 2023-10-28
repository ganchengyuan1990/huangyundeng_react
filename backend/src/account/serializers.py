from ninja import ModelSchema

from src.account.models import Account


class AccountSerializer(ModelSchema):
    class Config:
        model = Account
        model_fields = ('avatar_url', 'nickname', 'class_name', 'email', 'sex', 'desc', 'is_staff',)
