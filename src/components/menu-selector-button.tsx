import { styled } from '@/lib/theme';
import { ArrowDropDown, MoreHoriz } from '@mui/icons-material';
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useId, useState } from 'react';

type MenuOption =
  | {
      type?: 'menuitem';
      label: string;
      icon?: React.ReactNode;
      disabled?: boolean;
      onClick: () => void;
    }
  | { type: 'divider' };

const StyledListItemText = styled(ListItemText)(() => ({
  span: {
    color: ophColors.blue2,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  color: ophColors.blue2,
}));

export const MenuSelectorButton = ({
  label,
  options,
  disabled,
  type = 'default',
}: {
  label?: string;
  disabled?: boolean;
  options: Array<MenuOption>;
  type?: 'default' | 'icon-only';
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const id = useId();

  const buttonId = `MenuSelectorButton-${id}`;

  const showMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);

  return (
    <Box sx={{ display: 'block', position: 'relative' }}>
      <OphButton
        disabled={disabled}
        id={buttonId}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={showMenu}
        {...(type === 'icon-only'
          ? { endIcon: <MoreHoriz />, variant: 'text' }
          : {
              endIcon: <ArrowDropDown />,
              variant: 'outlined',
            })}
      >
        {label}
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
        {options.map((option) => {
          return option.type === 'divider' ? (
            <Divider />
          ) : (
            <MenuItem
              key={option.label}
              disabled={option.disabled}
              onClick={() => {
                option.onClick();
                closeMenu();
              }}
            >
              {option.icon && (
                <StyledListItemIcon>{option.icon}</StyledListItemIcon>
              )}
              <StyledListItemText>{option.label}</StyledListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};
