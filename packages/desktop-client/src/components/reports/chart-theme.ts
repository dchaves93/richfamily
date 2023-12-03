import { theme } from '../../style';

interface ColorFades {
  blueFadeStart: string;
  blueFadeEnd: string;
  redFadeStart: string;
  redFadeEnd: string;
}

let colorFades: ColorFades = {
  blueFadeStart: 'rgba(229, 245, 255, 1)',
  blueFadeEnd: 'rgba(229, 245, 255, 0)',
  redFadeStart: 'rgba(255, 243, 242, 1)',
  redFadeEnd: 'rgba(255, 243, 242, 0)',
};

// Typography
const sansSerif: string =
  'Inter var, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif';
const letterSpacing: string = 'normal';
const fontSize: number = 13;

// Labels
interface LabelStyles {
  fontFamily: string;
  fontSize: number;
  letterSpacing: string;
  fill: string;
  stroke: string;
}

const baseLabelStyles: LabelStyles = {
  fontFamily: sansSerif,
  fontSize,
  letterSpacing,
  fill: theme.reportsLabel,
  stroke: 'transparent',
};

interface AxisBaseStyles {
  axis: {
    fill: string;
    stroke: string;
  };
  grid: {
    fill: string;
    stroke: string;
    pointerEvents: string;
  };
  ticks: {
    fill: string;
    size: number;
    stroke: string;
  };
  axisLabel: LabelStyles;
  tickLabels: LabelStyles;
}

const axisBaseStyles: AxisBaseStyles = {
  axis: {
    fill: 'transparent',
    stroke: 'none',
  },
  grid: {
    fill: 'none',
    stroke: 'none',
    pointerEvents: 'none',
  },
  ticks: {
    fill: 'transparent',
    size: 1,
    stroke: 'none',
  },
  axisLabel: baseLabelStyles,
  tickLabels: baseLabelStyles,
};

interface ChartTheme {
  colors: {
    [key: string]: string;
  };
  area: {
    style: {
      labels: LabelStyles;
      data: {
        stroke: string;
        strokeWidth: number;
        strokeLinejoin: string;
        strokeLinecap: string;
      };
    };
  };
  axis: {
    style: AxisBaseStyles;
  };
  dependentAxis: {
    style: {
      grid: {
        stroke: string;
        strokeDasharray: string;
      };
      tickLabels: {
        padding: number;
      };
    };
  };
  independentAxis: {
    style: {
      axis: {
        stroke: string;
      };
      tickLabels: {
        padding: number;
      };
    };
  };
  bar: {
    style: {
      labels: LabelStyles;
      data: {
        fill: string;
        stroke: string;
      };
    };
  };
  line: {
    style: {
      labels: LabelStyles;
      data: {
        fill: string;
        stroke: string;
        strokeWidth: number;
        strokeLinejoin: string;
        strokeLinecap: string;
      };
    };
  };
  voronoi: {
    style: {
      labels: LabelStyles;
    };
  };
  chart: {
    padding: {
      top: number;
      left: number;
      right: number;
      bottom: number;
    };
  };
}

export const chartTheme: ChartTheme = {
  colors: {
    ...colorFades,
    red: theme.reportsRed,
    blue: theme.reportsBlue,
  },
  area: {
    style: {
      labels: baseLabelStyles,
      data: {
        stroke: theme.reportsBlue,
        strokeWidth: 2,
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
      },
    },
  },
  axis: {
    style: axisBaseStyles,
  },
  dependentAxis: {
    style: {
      ...axisBaseStyles,
      grid: {
        ...axisBaseStyles.grid,
        stroke: theme.pageTextSubdued,
        strokeDasharray: '1,1',
      },
      tickLabels: { ...baseLabelStyles, padding: 5 },
    },
  },
  independentAxis: {
    style: {
      ...axisBaseStyles,
      axis: { ...axisBaseStyles.axis, stroke: theme.pageTextSubdued },
      tickLabels: { ...baseLabelStyles, padding: 10 },
    },
  },
  bar: {
    style: {
      labels: baseLabelStyles,
      data: { fill: theme.reportsBlue, stroke: 'none' },
    },
  },
  line: {
    style: {
      labels: baseLabelStyles,
      data: {
        fill: 'none',
        stroke: theme.reportsBlue,
        strokeWidth: 2,
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
      },
    },
  },
  voronoi: {
    style: {
      labels: baseLabelStyles,
    },
  },
  chart: {
    padding: {
      top: 20,
      left: 65,
      right: 20,
      bottom: 50,
    },
  },
};

interface ColorScales {
  [key: string]: string[];
};

export function getColorScale(name: string): string[] {
  const scales: ColorScales = {
    grayscale: ['#cccccc', '#969696', '#636363', '#252525'],
    qualitative: [
      '#45B29D', //Dark Teal
      '#EFC94C', //Yellow
      '#E27A3F', //Orange
      '#DF5A49', //Light Red
      '#5F91B8', //Blue
      '#E2A37F', //Peach
      '#55DBC1', //Light Teal
      '#EFDA97', //Light Yellow
      '#DF948A', //Light Red
    ],
    heatmap: ['#428517', '#77D200', '#D6D305', '#EC8E19', '#C92B05'],
    warm: ['#940031', '#C43343', '#DC5429', '#FF821D', '#FFAF55'],
    cool: ['#2746B9', '#0B69D4', '#2794DB', '#31BB76', '#60E83B'],
    red: ['#FCAE91', '#FB6A4A', '#DE2D26', '#A50F15', '#750B0E'],
    blue: ['#002C61', '#004B8F', '#006BC9', '#3795E5', '#65B4F4'],
    green: ['#354722', '#466631', '#649146', '#8AB25C', '#A9C97E'],
  };
  return name ? scales[name] : scales.grayscale;
}
