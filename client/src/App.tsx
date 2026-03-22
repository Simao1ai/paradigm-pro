import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/DashboardLayout";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import LessonsPage from "@/pages/LessonsPage";
import LessonDetailPage from "@/pages/LessonDetailPage";
import JournalPage from "@/pages/JournalPage";
import GoalsPage from "@/pages/GoalsPage";
import RoadmapPage from "@/pages/RoadmapPage";
import AchievementsPage from "@/pages/AchievementsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import BillingPage from "@/pages/BillingPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import ConsultantPage from "@/pages/ConsultantPage";
import PricingPage from "@/pages/PricingPage";
import CheckInPage from "@/pages/CheckInPage";
import ReportsPage from "@/pages/ReportsPage";
import CommunityPage from "@/pages/CommunityPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import { Loader2 } from "lucide-react";

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-navy">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <AuthenticatedRoute component={DashboardPage} />;
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard">
        <AuthenticatedRoute component={DashboardPage} />
      </Route>
      <Route path="/lessons">
        <AuthenticatedRoute component={LessonsPage} />
      </Route>
      <Route path="/lessons/:slug">
        <AuthenticatedRoute component={LessonDetailPage} />
      </Route>
      <Route path="/journal">
        <AuthenticatedRoute component={JournalPage} />
      </Route>
      <Route path="/goals">
        <AuthenticatedRoute component={GoalsPage} />
      </Route>
      <Route path="/roadmap">
        <AuthenticatedRoute component={RoadmapPage} />
      </Route>
      <Route path="/achievements">
        <AuthenticatedRoute component={AchievementsPage} />
      </Route>
      <Route path="/notifications">
        <AuthenticatedRoute component={NotificationsPage} />
      </Route>
      <Route path="/billing">
        <AuthenticatedRoute component={BillingPage} />
      </Route>
      <Route path="/profile">
        <AuthenticatedRoute component={ProfilePage} />
      </Route>
      <Route path="/admin">
        <AuthenticatedRoute component={AdminPage} />
      </Route>
      <Route path="/consultant">
        <AuthenticatedRoute component={ConsultantPage} />
      </Route>
      <Route path="/check-in">
        <AuthenticatedRoute component={CheckInPage} />
      </Route>
      <Route path="/reports">
        <AuthenticatedRoute component={ReportsPage} />
      </Route>
      <Route path="/community">
        <AuthenticatedRoute component={CommunityPage} />
      </Route>
      <Route path="/community/leaderboard">
        <AuthenticatedRoute component={LeaderboardPage} />
      </Route>
      <Route path="/pricing" component={PricingPage} />
      <Route>
        <div className="flex items-center justify-center min-h-screen bg-brand-navy">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-white mb-4">404</h1>
            <p className="text-muted-foreground mb-6">Page not found</p>
            <a href="/" className="btn-gold rounded-xl px-6 py-3 text-sm font-semibold inline-block">
              Go Home
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}
