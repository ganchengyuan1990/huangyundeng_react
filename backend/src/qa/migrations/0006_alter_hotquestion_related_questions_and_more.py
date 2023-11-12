# Generated by Django 4.2.6 on 2023-11-12 13:27

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("qa", "0005_hotquestion_related_questions_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="hotquestion",
            name="related_questions",
            field=models.TextField(null=True, verbose_name="相关问题"),
        ),
        migrations.AlterField(
            model_name="hotquestion",
            name="similar_questions",
            field=models.TextField(null=True, verbose_name="相似问题"),
        ),
    ]
