from .version import __version__

# Set matplotlib backend to avoid NSWindow issues on macOS
try:
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    # Disable interactive mode completely
    matplotlib.interactive(False)
    # Set environment variable to prevent GUI backend selection
    import os
    os.environ['MPLBACKEND'] = 'Agg'
except ImportError:
    pass  # matplotlib not available

__all__ = ["__version__"]
