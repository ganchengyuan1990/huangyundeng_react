# Generated by Django 4.2.6 on 2023-11-12 12:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("account", "0005_platform"),
        ("qa", "0003_alter_qarecord_match_question"),
    ]

    operations = [
        migrations.AddField(
            model_name="hotquestion",
            name="platform",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="account.platform",
            ),
        ),
        migrations.AddField(
            model_name="qarecord",
            name="platform",
            field=models.ForeignKey(
                default=None,
                on_delete=django.db.models.deletion.CASCADE,
                to="account.platform",
            ),
            preserve_default=False,
        ),
    ]
