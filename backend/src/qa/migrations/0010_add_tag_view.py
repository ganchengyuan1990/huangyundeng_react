# Generated by Django 4.2.6 on 2024-01-02 19:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("qa", "0009_remove_hotquestion_tag_hotquestion_tags"),
    ]

    operations = [
        migrations.RunSQL("""
CREATE VIEW qa_hotquestion_tag AS
SELECT tag, COUNT(*) AS tag_count
FROM (
  SELECT jsonb_array_elements_text(tags) AS tag
  FROM qa_hotquestion
) AS tag_list
WHERE tag != ''
GROUP BY tag
ORDER BY 2"""),
    ]