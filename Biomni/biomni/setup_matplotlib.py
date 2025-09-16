#!/usr/bin/env python3
"""
Setup script to configure matplotlib for headless operation.
This should be imported before any matplotlib usage to avoid GUI issues.
"""

import os


def setup_matplotlib():
    """Configure matplotlib for headless operation."""
    # Set environment variables before importing matplotlib
    os.environ['MPLBACKEND'] = 'Agg'
    os.environ['DISPLAY'] = ''  # Disable X11 display
    
    try:
        import matplotlib
        # Force backend selection
        matplotlib.use('Agg', force=True)
        # Disable interactive mode
        matplotlib.interactive(False)
        
        # Suppress warnings about non-interactive backend
        import warnings
        warnings.filterwarnings('ignore', message='.*non-interactive.*')
        warnings.filterwarnings('ignore', message='.*FigureCanvasAgg.*')
        warnings.filterwarnings('ignore', message='.*cannot be shown.*')
        
        # Disable any potential display functions
        import matplotlib.pyplot as plt
        # Override show function to do nothing
        plt.show = lambda *args, **kwargs: None
        
        print("Matplotlib configured for headless operation")
        return True
    except ImportError:
        print("Matplotlib not available")
        return False


if __name__ == "__main__":
    setup_matplotlib()


