import logging
import sys

def setup_logging():
    """Configure structured console logging for the application.
    
    Sets up the root logger to output to stdout with a standard format.
    Uvicorn's loggers are also redirected to use this configuration.
    """
    log_format = (
        "%(asctime)s - [%(levelname)s] - %(name)s - "
        "(%(filename)s:%(lineno)d) - %(message)s"
    )
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Re-wire uvicorn loggers to use the root handler and propagate
    for logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        logger = logging.getLogger(logger_name)
        logger.handlers.clear()
        logger.propagate = True
