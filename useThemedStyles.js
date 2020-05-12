import { useState, useEffect } from "react";
import { useStyles } from "@raydeck/react-native-theme-provider";
const useThemedStyles = (f, data) => {
  const [options, setOptions] = useState({});
  useEffect(() => {
    setOptions({ data });
  }, [data]);
  return useStyles(f, options);
};
export default useThemedStyles;
