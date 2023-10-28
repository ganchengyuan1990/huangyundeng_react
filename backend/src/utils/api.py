from enum import Enum, IntEnum
from typing import Optional

from ninja import Schema


class ApiResponseResultCode(IntEnum):
    Success = 0,
    BAD_REQUEST = 400,
    AUTH_REQUIRE = 401,  # 作为非登录接口，授权失败用
    PAYMENT_REQUIRED = 402,
    PARAM_ERROR = 403,  # 作为服务端主动抛出UserException用
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,  # 作为客户端参数不合理用
    REQUEST_TIMEOUT = 408,

    SYSTEM_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,


class UserException(Exception):
    result_code: ApiResponseResultCode
    msg: str

    def __init__(self, msg, result_code=ApiResponseResultCode.PARAM_ERROR):
        super().__init__(msg)
        self.msg = msg
        if result_code:
            self.result_code = result_code


class ApiResponse(Schema):
    result_code: int
    msg: Optional[str]

    @staticmethod
    def success(**args):
        return {"result_code": 0, **args}

    @staticmethod
    def error(result: ApiResponseResultCode, msg: str = "error message"):
        return {"result_code": int(result), "msg": msg}
