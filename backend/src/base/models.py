from enum import Enum

from django.db import models


class BaseModel(models.Model):
    create_at = models.DateTimeField(auto_now_add=True, editable=False)
    update_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True


class BaseModelEnum(Enum):
    def __str__(self):
        return self.name

    def __eq__(self, other):
        return self.name == other

    @classmethod
    def model_items(cls):
        return [(v.name, v.value) for (k, v) in cls.__members__.items()]

    @classmethod
    def for_ninjia_in(cls):
        return BaseModelEnum('Enum ' + cls.__name__ + ' InSchema', [(v.name, v.name) for (k, v) in cls.__members__.items()])

