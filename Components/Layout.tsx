import Navigation from './Navigation';
import { Container } from '@chakra-ui/react';

const Layout = ({ children }) => {
  return (
    <>
      <Navigation />
      <Container m={0} p={0}>{children}</Container>
    </>
  );
};

export default Layout;
