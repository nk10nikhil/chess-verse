import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Users, Zap, Trophy, MessageSquare, Shield, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section with Chess-themed Background */}
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
          {/* Chess-themed background patterns */}
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern opacity-10"></div>

          {/* Animated chess pieces in background */}
          <div className="absolute top-20 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -right-10 w-60 h-60 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-2 w-fit">
                  <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-primary mr-2"></span>
                  ChessVerse - Where Masters Meet
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    Play Chess Online With Style & Strategy
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Challenge friends to private matches or find worthy opponents. Experience chess in a beautiful,
                    responsive interface that combines tradition with modern technology.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90 hover:scale-105 transition-transform">
                      Start Playing Now
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="w-full border-primary/20 hover:bg-primary/10 hover:scale-105 transition-transform">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <img src="user.jpg" alt="User Avatar" className="w-10 h-10 rounded-full border border-primary/10" />
                  <div className="text-muted-foreground">
                    <span className="font-bold text-foreground">5,000+</span> players joined last month
                  </div>
                </div>
              </div>
              <div className="lg:order-last relative group perspective">
                <div className="relative shadow-2xl rounded-xl bg-gradient-to-tr from-primary/5 to-secondary/5 p-2 border border-primary/10 backdrop-blur-sm transform transition duration-500 group-hover:rotate-y-6 group-hover:scale-105">
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl"></div>
                  <img
                  alt="Chess Game Preview"
                  className="rounded-lg object-cover shadow-lg w-full"
                  src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  />
                </div>
                <div className="absolute inset-0 rounded-xl border border-primary/10 bg-gradient-to-tr from-primary/5 to-secondary/5 backdrop-blur-sm -z-10 transform -rotate-3 scale-[0.97] opacity-70"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-10 border-y border-primary/10 bg-secondary/5 backdrop-blur-sm">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary">10K+</span>
                <span className="text-muted-foreground">Active Players</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary">50K+</span>
                <span className="text-muted-foreground">Games Played</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary">120+</span>
                <span className="text-muted-foreground">Countries</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary">4.9</span>
                <span className="text-muted-foreground">User Rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Beautiful Cards */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-2">
                Premium Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary/80 to-primary">
                Game-Changing Chess Experience
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">
                Everything you need for an unforgettable chess journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-10 w-10" />,
                  title: "Real-time Gameplay",
                  description: "Experience smooth, lag-free chess matches with our advanced WebSocket technology and state management."
                },
                {
                  icon: <Users className="h-10 w-10" />,
                  title: "Private Matches",
                  description: "Create private rooms and invite friends with a unique room ID. Play on your terms with people you know."
                },
                {
                  icon: <Trophy className="h-10 w-10" />,
                  title: "Rating System",
                  description: "Track your progress with our ELO-based rating system. Climb the ranks and become a chess master."
                },
                {
                  icon: <MessageSquare className="h-10 w-10" />,
                  title: "In-game Chat",
                  description: "Communicate with your opponent during matches. Discuss strategy or simply enjoy the conversation."
                },
                {
                  icon: <Shield className="h-10 w-10" />,
                  title: "Secure Play",
                  description: "Your games are protected with end-to-end security. Play with confidence knowing your data is safe."
                },
                {
                  icon: <Clock className="h-10 w-10" />,
                  title: "Game Analysis",
                  description: "Review your past games to learn from mistakes and improve your strategy for future matches."
                }
              ].map((feature, i) => (
                <div key={i} className="group relative flex flex-col items-center rounded-xl p-6 bg-gradient-to-tr from-primary/5 to-secondary/5 border border-primary/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-primary/0 opacity-0 blur group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative">
                    <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-center">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-secondary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-2">
                Player Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Players Say</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Hear from chess enthusiasts from around the world
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "The best online chess platform I've used. Clean interface and smooth gameplay make it my go-to chess site.",
                  name: "Alex Johnson",
                  title: "Chess Master"
                },
                {
                  quote: "I love the ability to create private rooms and play with friends. The in-game chat adds a social element that makes games more enjoyable.",
                  name: "Sarah Williams",
                  title: "Amateur Player"
                },
                {
                  quote: "The rating system gives me something to work toward. I've seen my skills improve significantly since I started playing here.",
                  name: "Michael Chen",
                  title: "Tournament Player"
                }
              ].map((testimonial, i) => (
                <div key={i} className="flex flex-col space-y-4 rounded-xl p-6 bg-background border border-primary/10">
                  <div className="flex-1">
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img src="user.jpg" alt="User Avatar" className="w-12 h-12 rounded-full border border-primary/10" />
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Make Your Next Move?
              </h2>
              <p className="text-muted-foreground text-xl">
                Join thousands of players and start your chess journey today. Create an account and play your first game in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 px-8">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="w-full border-t py-8 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <h3 className="text-lg font-bold">ChessVerse</h3>
              <p className="text-sm text-muted-foreground">Play chess online with friends and opponents from around the world in a beautiful, responsive interface.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Features</h3>
              <ul className="space-y-2">
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Real-time Gameplay</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Private Matches</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Rating System</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Game Analysis</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-2">
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">About Us</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Blog</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Careers</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2">
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Terms of Service</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Privacy Policy</Link></li>
                <li><Link className="text-sm text-muted-foreground hover:text-primary" href="#">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 ChessVerse. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link className="text-muted-foreground hover:text-primary" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
