# Generated by Django 4.2.6 on 2023-10-30 10:49

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="HotQuestion",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("create_at", models.DateTimeField(auto_now_add=True)),
                ("update_at", models.DateTimeField(auto_now=True)),
                (
                    "region",
                    models.CharField(max_length=255, null=True, verbose_name="地域"),
                ),
                (
                    "category_1",
                    models.CharField(max_length=255, null=True, verbose_name="大类"),
                ),
                (
                    "category_2",
                    models.CharField(max_length=255, null=True, verbose_name="小类"),
                ),
                ("tag", models.CharField(max_length=255, null=True, verbose_name="标签")),
                (
                    "standard_question",
                    models.CharField(max_length=255, null=True, verbose_name="标准问题"),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
