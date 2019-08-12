import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  Fragment
} from "react";
import { ScrollView } from "react-native";
import { Portal, Dialog, List, Button } from "react-native-paper";
import Markdown from "react-native-markdown-renderer";
import Deferred from "es6-deferred";
const context = createContext();
const DProvider = context.Provider;
const DialogProvider = ({ children }) => {
  const [isDialog, setIsDialog] = useState(false);
  const [message, setMessage] = useState();
  const [pre, setPre] = useState();
  const [post, setPost] = useState();
  const [title, setTitle] = useState();
  const [actions, setActions] = useState([]);
  const [cancelText, setCancelText] = useState("cancel");
  const [dismissKey, setDismissKey] = useState();
  const [contentStyle, setContentStyle] = useState({});
  const clearDismiss = useCallback(() => setDismissKey(null), []);
  const dismissDialog = useCallback(key => {
    setDismissKey(key);
    setIsDialog(false);
  }, []);
  const [value, setValue] = useState({
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
    setContentStyle
  });
  useEffect(() => {
    setValue({
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
      setContentStyle
    });
  }, [cancelText, dismissKey, clearDismiss, isDialog]);
  const ret = [
    <Portal key="dialog-provider-portal">
      <Dialog visible={isDialog} onDismiss={() => setIsDialog(false)}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        <Dialog.Content style={contentStyle}>
          <Dialog.ScrollArea>
            {pre && pre}
            {message && (
              <ScrollView style={{ maxHeight: 300 }}>
                <Markdown>{message}</Markdown>
              </ScrollView>
            )}
            {post && post}
          </Dialog.ScrollArea>
          <List.Section>
            {actions.map(({ icon, title, key, description }) => (
              <List.Item
                key={`dialog-provider-list-item-${key}`}
                left={() => icon && <List.Icon icon={icon} />}
                onPress={() => dismissDialog(key)}
                title={title}
                description={description}
              />
            ))}
          </List.Section>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => dismissDialog("cancel")}>{cancelText}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>,
    <DProvider key="dialog-provider-provider" value={value}>
      {children}
    </DProvider>
  ];
  return ret;
};
const withDialog = C => props => {
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
    setContentStyle
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
        contentStyle = {}
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
      setIsDialog(true);
      const promise = new Deferred();
      setPromise(promise);
      const outkey = await promise.promise;
      setContentStyle({});
      if (typeof callback === "function") return f(outkey);
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
