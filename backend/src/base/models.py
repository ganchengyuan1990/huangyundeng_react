from django.db import models


class BaseModel(models.Model):
    create_at = models.DateTimeField(auto_now_add=True, editable=False)
    update_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True
