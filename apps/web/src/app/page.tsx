'use client';

import Link from 'next/link';
import { Container, Title, Text, Button, Group, Card, SimpleGrid } from '@mantine/core';

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>HMS SAAS</div>
          <Group gap="md">
            <Button component={Link} href="/login" color="red">
              Login
            </Button>
            <Button component={Link} href="/signup" color="green">
              Sign Up
            </Button>
          </Group>
        </div>
      </nav>

      {/* Hero Section */}
      <Container
        size="lg"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Title
          order={1}
          size="3.5rem"
          fw={700}
          mb="lg"
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
        >
          Hospital Management System
        </Title>
        <Text size="xl" mb="xl" maw={600} lh={1.6} style={{ opacity: 0.9 }}>
          Streamline your healthcare operations with our comprehensive Hospital Management System.
          Manage patients, appointments, staff, and resources efficiently.
        </Text>

        {/* Feature Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" maw={900} mt="xl">
          <Card
            padding="xl"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
            }}
          >
            <Title order={3} size="1.3rem" mb="md" fw={600}>
              Patient Management
            </Title>
            <Text style={{ opacity: 0.8, lineHeight: 1.5 }}>
              Complete patient records, medical history, and appointment scheduling
            </Text>
          </Card>

          <Card
            padding="xl"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
            }}
          >
            <Title order={3} size="1.3rem" mb="md" fw={600}>
              Staff Management
            </Title>
            <Text style={{ opacity: 0.8, lineHeight: 1.5 }}>
              Manage doctors, nurses, and administrative staff efficiently
            </Text>
          </Card>

          <Card
            padding="xl"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
            }}
          >
            <Title order={3} size="1.3rem" mb="md" fw={600}>
              Analytics & Reports
            </Title>
            <Text style={{ opacity: 0.8, lineHeight: 1.5 }}>
              Comprehensive reporting and analytics for better decision making
            </Text>
          </Card>
        </SimpleGrid>

        {/* CTA Buttons */}
        <Group justify="center" mt="xl" gap="md">
          <Button
            component={Link}
            href="/signup"
            size="lg"
            color="green"
            fw={600}
            style={{
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            Get Started
          </Button>

          <Button component={Link} href="/dashboard" size="lg" color="red" fw={600}>
            View Dashboard
          </Button>
        </Group>
      </Container>

      {/* Footer */}
      <footer
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '2rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <p>&copy; 2024 HMS SAAS. All rights reserved.</p>
      </footer>
    </div>
  );
}
