

from src.account.models import Platform


def get_platform(mini_id: str) -> Platform:
    """ 获取平台对应的配置信息 """
    platforms = Platform.objects.all()
    default_platform = None
    for platform in platforms:
        if platform.host == mini_id or platform.wx_appid == mini_id:
            return platform
        if platform.as_default:
            default_platform = platform
    else:
        return default_platform
