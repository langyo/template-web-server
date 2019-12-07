import React from 'react';
import { makeStyles } from "@material-ui/core/styles";

import {
  Dialog,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Chip,
  TextField
} from "@material-ui/core";

import {
  ToggleButton,
  ToggleButtonGroup
} from "@material-ui/lab";

import Icon from "@mdi/react";
import {
  mdiContentSave,
  mdiClose,
  mdiCircle,
  mdiClock,
  mdiFormatAlignCenter,
  mdiFormatAlignLeft,
  mdiFormatAlignRight,
  mdiFormatBold,
  mdiFormatItalic,
  mdiFormatUnderline,
  mdiFormatColorFill,
  mdiFormatColorHighlight,
  mdiFormatAnnotationPlus,
  mdiFormatAnnotationMinus,
  mdiFormatListCheckbox,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiPlus
} from "@mdi/js";

import { Editor, EditorState, RichUtils } from 'draft-js';

export default props => {
  const classes = makeStyles(theme => ({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    content: {
      margin: 10,
      padding: 10,
      height: 400
    },
    divider: {
      marginTop: 10,
      marginBottom: 10
    },
    chip: {
      marginRight: 4
    }
  }))();

  const [content, setContent] = React.useState(EditorState.createEmpty());

  const [isOpen, setOpen] = React.useState(true);
  const close = () => {
    setOpen(false);
    setTimeout(props.$destory, 500);
  }

  return [
    <Dialog
      open={isOpen}
      onClose={close}
      fullWidth
      maxWidth="xl"
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton color="inherit" onClick={close}>
            <Icon path={mdiClose} size={1} color="#fff" />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            编辑笔记
          </Typography>
          <IconButton color="inherit" onClick={close}>
            <Icon path={mdiContentSave} size={1} color="#fff" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Paper className={classes.content}>
        <ToggleButtonGroup >
          <ToggleButton value="left">
            <Icon path={mdiFormatAlignLeft} size={1} />
          </ToggleButton>
          <ToggleButton value="center">
            <Icon path={mdiFormatAlignCenter} size={1} />
          </ToggleButton>
          <ToggleButton value="right">
            <Icon path={mdiFormatAlignRight} size={1} />
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup >
          <ToggleButton value="bold" onClick={() => setContent(RichUtils.toggleInlineStyle(content, 'BOLD'))}>
            <Icon path={mdiFormatBold} size={1} />
          </ToggleButton>
          <ToggleButton value="italic" onClick={() => setContent(RichUtils.toggleInlineStyle(content, 'ITALIC'))}>
            <Icon path={mdiFormatItalic} size={1} />
          </ToggleButton>
          <ToggleButton value="underlined" onClick={() => setContent(RichUtils.toggleInlineStyle(content, 'UNDERLINE'))}>
            <Icon path={mdiFormatUnderline} size={1} />
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup >
          <ToggleButton value="fill">
            <Icon path={mdiFormatColorFill} size={1} />
            <Icon path={mdiCircle} size={1.2} color="#FFF" />
          </ToggleButton>
          <ToggleButton value="highlight">
            <Icon path={mdiFormatColorHighlight} size={1} />
            <Icon path={mdiCircle} size={1.2} />
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup >
          <ToggleButton value="plus">
            <Icon path={mdiFormatAnnotationPlus} size={1} />
          </ToggleButton>
          <ToggleButton value="minus">
            <Icon path={mdiFormatAnnotationMinus} size={1} />
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup >
          <ToggleButton value="checkbox">
            <Icon path={mdiFormatListCheckbox} size={1} />
          </ToggleButton>
          <ToggleButton value="dot">
            <Icon path={mdiFormatListBulleted} size={1} />
          </ToggleButton>
          <ToggleButton value="numbered">
            <Icon path={mdiFormatListNumbered} size={1} />
          </ToggleButton>
        </ToggleButtonGroup>
        <Divider className={classes.divider} />
        <TextField fullWidth label="标题" />
        <Divider className={classes.divider} />
        <Chip
          avatar={<Icon path={mdiClock} size={1} />}
          label={"未知时间"}
          onClick={() => { }}
          className={classes.chip}
        />
        <Chip
          label="测试标签"
          onDelete={() => { }}
          className={classes.chip}
        />
        <IconButton size="small">
          <Icon path={mdiPlus} size={1} />
        </IconButton>
        <Divider className={classes.divider} />
        <Editor
          editorState={content}
          onChange={setContent}
          handleKeyCommand={(command, editorState) => {
            const newState = RichUtils.handleKeyCommand(editorState, command);
            if (newState) {
              setContent(newState);
              return 'handled';
            }
            return 'not-handled';
          }}
          blockStyleFn={blockName => {
            switch (blockName.getType()) {
              case 'blockquote':
                return 'RichEditor-blockquote';
              default:
                return null;
            }
          }}
        />
      </Paper>
    </Dialog>
  ];
}