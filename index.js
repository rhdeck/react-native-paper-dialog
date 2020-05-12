import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { ScrollView } from "react-native";
import { Portal, Dialog, List, Button } from "react-native-paper";
import Markdown from "react-native-markdown-renderer";
import Deferred from "es6-deferred";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import useThemedStyles from "./useThemedStyles";
const context = createContext();
const DProvider = context.Provider;
const DialogProvider = ({ children }) => {
  const { markdown } = useThemedStyles(makeStyles);
  const [isDialog, setIsDialog] = useState(false);
  const [message, setMessage] = useState();
  const [pre, setPre] = useState();
  const [post, setPost] = useState();
  const [title, setTitle] = useState();
  const [actions, setActions] = useState([]);
  const [cancelText, setCancelText] = useState("cancel");
  const [dismissKey, setDismissKey] = useState();
  const [contentStyle, setContentStyle] = useState({});
  const [scrollViewStyle, setScrollViewStyle] = useState({ maxHeight: 300 });
  const [messageStyle, setMessageStyle] = useState(null);
  const clearDismiss = useCallback(() => setDismissKey(null), []);
  const dismissDialog = useCallback((key) => {
    setDismissKey(key);
    setIsDialog(false);
  }, []);
  const value = useMemo(
    () => ({
      cancelText,
      dismissKey,
      clearDismiss,
      isDialog,
      setMessage,
      setTitle,
      setActions,
      setCancelText,
      setIsDialog,
      setPre,
      setPost,
      setContentStyle,
      setScrollViewStyle,
      setMessageStyle,
    }),
    [cancelText, dismissKey, clearDismiss, isDialog]
  );
  const ret = [
    <Portal key="dialog-provider-portal">
      <Dialog visible={isDialog} onDismiss={() => dismissDialog("cancel")}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        <Dialog.Content style={contentStyle}>
          <Dialog.ScrollArea>
            {pre && pre}
            {message && (
              <ScrollView style={scrollViewStyle}>
                <Markdown style={{ ...markdown, ...messageStyle }}>
                  {message}
                </Markdown>
              </ScrollView>
            )}
            {post && post}
          </Dialog.ScrollArea>
          <List.Section>
            {actions.map(
              ({
                icon,
                title,
                key,
                description,
                iconFamily,
                iconProps = {},
                listItemProps = {},
              }) => {
                let targetIcon;
                switch (iconFamily) {
                  case "materialCommunity":
                    {
                      // eslint-disable-next-line react/display-name
                      targetIcon = (props) => (
                        <MaterialCommunityIcon {...props} name={icon} />
                      );
                    }
                    break;
                  default:
                    targetIcon = icon;
                }
                return (
                  <List.Item
                    key={`dialog-provider-list-item-${key}`}
                    left={() =>
                      icon && <List.Icon icon={targetIcon} {...iconProps} />
                    }
                    onPress={() => dismissDialog(key)}
                    title={title}
                    description={description}
                    {...listItemProps}
                  />
                );
              }
            )}
          </List.Section>
        </Dialog.Content>
        <Dialog.Actions>
          {cancelText ? (
            <Button onPress={() => dismissDialog("cancel")}>
              {cancelText}
            </Button>
          ) : null}
        </Dialog.Actions>
      </Dialog>
    </Portal>,
    <DProvider key="dialog-provider-provider" value={value}>
      {children}
    </DProvider>,
  ];
  return ret;
};
const withDialog = (C) => (props) => {
  return (
    <DialogProvider>
      <C {...props} />
    </DialogProvider>
  );
};
const useShowDialog = () => {
  const {
    dismissKey,
    clearDismiss,
    setMessage,
    setTitle,
    setActions,
    setCancelText,
    setIsDialog,
    setPre,
    setPost,
    setContentStyle,
    setScrollViewStyle,
    setMessageStyle,
  } = useContext(context);
  const showDialog = useCallback(
    async (
      {
        title,
        cancelText = "Close",
        actions = [],
        message = null,
        pre = null,
        post = null,
        contentStyle = {},
        scrollViewStyle = { maxHeight: 300 },
        messageStyle = null,
      },
      callback = null
    ) => {
      setTitle(title);
      setCancelText(cancelText);
      setActions(actions);
      setMessage(message);
      setPre(pre);
      setPost(post);
      setContentStyle(contentStyle);
      setScrollViewStyle(scrollViewStyle);
      setMessageStyle(messageStyle);
      setIsDialog(true);
      const promise = new Deferred();
      setPromise(promise);
      const outkey = await promise.promise;
      setContentStyle({});
      if (typeof callback === "function") return callback(outkey);
      return outkey;
    },
    []
  );
  const [promise, setPromise] = useState();
  useEffect(() => {
    if (promise && dismissKey) {
      promise.resolve(dismissKey);
      clearDismiss();
      setPromise(null);
    }
  }, [dismissKey, promise]);
  return showDialog;
};
export default DialogProvider;
export { useShowDialog, withDialog };
const makeStyles = (theme, isDark) => {
  if (!theme)
    return { markdown: { text: { color: isDark ? "white" : "black" } } };
  return {
    markdown: {
      text: { color: theme.colors.text },
    },
  };
};
