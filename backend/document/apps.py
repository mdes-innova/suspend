from django.apps import AppConfig


class DocumentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'document'

    def ready(self) -> None:
        super().ready()
        import document.signals
