import { styled } from '@/lib/theme';
import { ArrowDropDown, MoreHoriz } from '@mui/icons-material';
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuItemProps,
} from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import React, {
  createContext,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';

const StyledListItemText = styled(ListItemText)(() => ({
  span: {
    color: ophColors.blue2,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  color: ophColors.blue2,
}));

const MenuContext = createContext<{
  closeMenu?: () => void;
}>({});

const DropdownMenuItem = (
  props: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  } & MenuItemProps<'button'>,
) => {
  const { closeMenu } = use(MenuContext);

  return (
    <MenuItem
      key={props.label}
      disabled={props.disabled}
      onClick={() => {
        props?.onClick();
        closeMenu?.();
      }}
    >
      {props.icon && <StyledListItemIcon>{props.icon}</StyledListItemIcon>}
      <StyledListItemText>{props.label}</StyledListItemText>
    </MenuItem>
  );
};

const DropdownMenuButton = ({
  label,
  disabled,
  type = 'default',
  children,
}: {
  label?: string;
  disabled?: boolean;
  type?: 'default' | 'icon-only';
  children: React.ReactNode;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const id = useId();

  const buttonId = `Dropdown.MenuButton-${id}`;

  const showMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = useCallback(() => setAnchorEl(null), [setAnchorEl]);

  const menuContextValue = useMemo(
    () => ({
      closeMenu,
    }),
    [closeMenu],
  );

  return (
    <Box sx={{ display: 'block', position: 'relative' }}>
      <OphButton
        disabled={disabled}
        id={buttonId}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={type === 'icon-only' ? label : undefined}
        onClick={showMenu}
        {...(type === 'icon-only'
          ? { startIcon: <MoreHoriz />, variant: 'text' }
          : {
              endIcon: <ArrowDropDown />,
              variant: 'outlined',
            })}
      >
        {type === 'default' ? label : ''}
      </OphButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        slotProps={{
          list: {
            'aria-labelledby': buttonId,
          },
        }}
      >
        <MenuContext value={menuContextValue}>{children}</MenuContext>
      </Menu>
    </Box>
  );
};

export const Dropdown = {
  MenuButton: DropdownMenuButton,
  MenuItem: DropdownMenuItem,
};
