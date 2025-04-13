import React from 'react';
import { Heading, Flex } from '@chakra-ui/react';

const Header = () => {
  return (
    <Flex 
      as="header" 
      align="center" 
      justify="center" 
      py={5}
      px={8}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading 
        textAlign="center" 
        fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
        color="blue.600"
      >
        Animal Shelter Dashboard
      </Heading>
      {/* Logo can be added here when available */}
    </Flex>
  );
};

export default Header;