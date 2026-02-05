from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
from enum import Enum
import logging
import traceback

logger = logging.getLogger(__name__)

class ErrorCode(str, Enum):
    """Enumeration of error codes for consistent error handling."""
    # Authentication errors
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS"
    SESSION_INVALIDATED = "SESSION_INVALIDATED"

    # Task errors
    TASK_NOT_FOUND = "TASK_NOT_FOUND"
    TASK_ACCESS_DENIED = "TASK_ACCESS_DENIED"

    # Validation errors
    VALIDATION_ERROR = "VALIDATION_ERROR"
    PASSWORD_WEAK = "PASSWORD_WEAK"

    # General errors
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"

class TodoException(HTTPException):
    """Custom exception class for the TODO application."""

    def __init__(
        self,
        error_code: ErrorCode,
        detail: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        headers: Optional[dict] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code

def handle_validation_error(detail: str) -> TodoException:
    """Handle validation errors consistently."""
    return TodoException(
        error_code=ErrorCode.VALIDATION_ERROR,
        detail=detail,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )

def handle_authentication_error(detail: str = "Could not validate credentials") -> TodoException:
    """Handle authentication errors consistently."""
    return TodoException(
        error_code=ErrorCode.INVALID_CREDENTIALS,
        detail=detail,
        status_code=status.HTTP_401_UNAUTHORIZED
    )

def handle_authorization_error(detail: str = "Not enough permissions") -> TodoException:
    """Handle authorization errors consistently."""
    return TodoException(
        error_code=ErrorCode.TASK_ACCESS_DENIED,
        detail=detail,
        status_code=status.HTTP_403_FORBIDDEN
    )

def handle_resource_not_found(resource: str, resource_id: Optional[str] = None) -> TodoException:
    """Handle resource not found errors consistently."""
    if resource_id:
        detail = f"{resource} with ID {resource_id} not found"
    else:
        detail = f"{resource} not found"

    return TodoException(
        error_code=ErrorCode.TASK_NOT_FOUND,
        detail=detail,
        status_code=status.HTTP_404_NOT_FOUND
    )

def handle_internal_error(detail: str = "Internal server error") -> TodoException:
    """Handle internal server errors consistently."""
    return TodoException(
        error_code=ErrorCode.INTERNAL_ERROR,
        detail=detail,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

def exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for the application
    """
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)

    if isinstance(exc, TodoException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.error_code.value,
                    "message": exc.detail
                }
            }
        )
    elif isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": "HTTP_ERROR",
                    "message": exc.detail
                }
            }
        )
    else:
        # Log the full traceback for unexpected errors
        logger.error(f"Unexpected error: {traceback.format_exc()}")

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An internal server error occurred"
                }
            }
        )

def setup_error_handlers(app):
    """
    Register error handlers with the FastAPI app
    """
    @app.exception_handler(TodoException)
    async def handle_todo_exception(request: Request, exc: TodoException):
        return exception_handler(request, exc)

    @app.exception_handler(HTTPException)
    async def handle_http_exception(request: Request, exc: HTTPException):
        return exception_handler(request, exc)

    @app.exception_handler(Exception)
    async def handle_general_exception(request: Request, exc: Exception):
        return exception_handler(request, exc)