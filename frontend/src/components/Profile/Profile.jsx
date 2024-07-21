  import React, { useState } from 'react';
  import { useSelector, useDispatch } from 'react-redux';
  import { useNavigate } from 'react-router-dom';
  import { logout } from '../../redux/user/userSlice';

  const Profile = () => {
    const [isOpen, setIsOpen] = useState(false);
    const userSelector = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleToggle = () => {
      setIsOpen(!isOpen);
    };

    const handleLogout = () => {
      localStorage.clear();
      dispatch(logout());
      navigate('/');
    };

    return (
      <div className="relative">
        <button
          className="ml-2"
          onClick={handleToggle}
        >
          {userSelector.doctor && (
            <img src={localStorage.getItem('image')} alt={userSelector.username.charAt(0).toUpperCase()} className="rounded-full w-10 h-10" />
          )}
          {userSelector.admin && (
            <img src="/admin.png" alt="Admin" className="rounded-full w-10 h-10" />
          )}
        </button>

        {isOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 text-black ">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <div className="px-4 py-2 text-sm text-gray-700">
                {userSelector.username && userSelector.username.split(' ')[0] === 'doctor' ? (
                  <div className="flex items-center">
                    <img src={localStorage.getItem('image')} alt="Doctor" className="rounded-full w-8 h-8 mr-2" />
                    <div>
                      <span className="font-bold">{userSelector.username.split(' ')[1].toUpperCase()}</span><br />
                      <span className="text-xs text-gray-700 font-bold">({userSelector.id})</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <img src="/admin.png" alt="Admin" className="rounded-full w-8 h-8 mr-2" />
                    <div>
                      <span className="font-bold">ADMIN</span><br />
                      <span className="text-xs text-gray-700 font-bold">({userSelector.id})</span>
                    </div>
                  </div>
                )}
              </div>

              {userSelector.email && (
                <div className="px-4 py-2 text-sm text-gray-700 font-medium">
                  <span className="truncate" title={userSelector.email}>
                    {userSelector.email.length > 30 ? `${userSelector.email.substring(0, 25)}...` : userSelector.email}
                  </span>
                </div>
              )}

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Profile;
