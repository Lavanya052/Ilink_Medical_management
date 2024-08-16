import React, { useEffect, useState } from 'react';
import { makeGETrequest } from '../../utils/api';
import { login, logout } from '../../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { isTokenExpired } from '../../utils/isTokenExpired';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  IconButton, Typography, Menu, MenuItem, TextField, Box, Badge, Avatar, Drawer, List, ListItem,
  ListItemText, ListItemIcon, Divider, InputAdornment, Button, useMediaQuery, useTheme
} from '@mui/material';
import { Search as SearchIcon, Notifications as NotificationsIcon, Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Profile from '../Profile/Profile';
import 'react-toastify/dist/ReactToastify.css';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputError, setInputError] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const dispatch = useDispatch();
  const userSelector = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isTokenExpired(token) || !token) {
      const checkIfLoggedIn = async () => {
        const res = await makeGETrequest('http://localhost:5000/users/checkifLoggedin', token);
        if (res.status === 200 && res.admin === true) {
          dispatch(login({
            id: res.id,
            username: 'admin',
            email: res.email,
            admin: res.admin,
            person: res.person,
            tokenexpiration: jwtDecode(token).exp,
          }));
        }
        if (res.status === 200 && res.doctor === true) {
          dispatch(login({
            id: res.id,
            email: res.email,
            phone: res.phone,
            username: res.username,
            firstname: res.firstName,
            lastname: res.lastName,
            doctor: res.doctor,
            person: res.person,
            tokenexpiration: jwtDecode(token).exp,
          }));
          const dataUrl = `data:image/jpeg;base64,${res.image}`;
          localStorage.setItem('image', dataUrl);
        }
      };
      checkIfLoggedIn();
    } else {
      localStorage.clear();
      dispatch(logout());
    }
  }, [dispatch, userSelector.username]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  async function submitSearch(e) {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      setInputError(true);
      toast.error('Please enter a search term');
      return;
    }
    setInputError(false);
    const url = new URL('http://localhost:5000/doctors/searchdoctor');
    if (searchTerm.match(/^[\d{4}]+$/)) {
      url.searchParams.append('id', searchTerm);
    } else {
      url.searchParams.append('username', searchTerm);
    }
    try {
      const res = await makeGETrequest(url.toString());
      if (res.doctors) {
        const doctorsWithImages = res.doctors.map(doctor => ({
          ...doctor,
          imageUrl: `data:${doctor.image.contentType};base64,${doctor.image.Image}`
        }));
        setDoctors(doctorsWithImages);
        navigate(`/search-result?id=${searchTerm}`);
      } else {
        setDoctors([]);
        navigate(`/search-result?id=${searchTerm}`);
      }
    } catch (error) {
      console.error('Error during search:', error);
      toast.error('Error occurred during search');
    }
  }

  const rightDrawerItems = (
    <List>
      <ListItem button component={Link} to="/profile">
        <ListItemIcon><Avatar src={localStorage.getItem('image')} alt="doctor" /></ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItem>
    </List>
  );

  return (
    <div className="flex justify-between items-center p-2 bg-sky-700">
      <TextField
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => { if (e.key === 'Enter') submitSearch(e); }}
        placeholder="Search Doctors"
        InputProps={{
          disableUnderline: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={submitSearch} >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          style: { paddingLeft: '0' }
        }}
        variant="standard"
        size="small"
        sx={{
          backgroundColor: 'white',
          borderRadius: '10px',
          marginLeft:"10px",
          '& .MuiInputBase-input': {
            borderRadius: '10px',
            backgroundColor: 'white',
            padding: '10px 15px',
          }
        }}
      />
      <Box className="flex items-center">

        {userSelector.doctor && !isSmallScreen && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              color: 'black',
              marginLeft: '1',
              borderRadius: '10px',
              backgroundColor: '#e2e8f0',
              '&:hover': {
                backgroundColor: '#bae6fd', // Darker blue on hover
              },
            }}
            onClick={() => navigate('/create-schedule')}
          >
            Create Schedule
          </Button>
        )}
        {/* Show only the plus icon on small screens */}
        {userSelector.doctor && isSmallScreen && (
          <IconButton
            sx={{
              color: 'black',
              backgroundColor: '#e2e8f0', // Blue background
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: '#bae6fd', // Darker blue on hover
              },
              marginLeft: '1',
            }}
            onClick={() => navigate('/create-schedule')}
          >
            <AddIcon />
          </IconButton>
        )}
        <IconButton
          sx={{
            color: 'white',
            borderRadius: '50%',
            marginLeft: '3',
            // Hide on small screens
          }}
          onClick={handleNotificationClick}
        >
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Profile sx={{ display: isSmallScreen ? 'none' : 'inline-flex' }} />



      </Box>
      {userSelector.username && (
        <Drawer anchor="right" open={location.pathname === '/profile'} onClose={toggleProfile}>
          <Box sx={{ width: 250 }} role="presentation">
            {rightDrawerItems}
            <Divider />
          </Box>
        </Drawer>
      )}
    </div>
  );
};

export default Header;
