# Generated by Django 4.2.6 on 2023-11-19 23:20

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("qa", "0007_qarecordfeedback"),
    ]

    operations = [
        migrations.AlterField(
            model_name="qarecordfeedback",
            name="message",
            field=models.TextField(null=True, verbose_name="详细信息"),
        ),
    ]
