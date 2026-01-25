import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { projects, skills } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ContactForm } from "@/components/contact-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BrainCircuit, Database, Github, Linkedin, Mail, Phone, ShieldCheck } from "lucide-react";

const HeroSection = () => {
  const profileImage = PlaceHolderImages.find(p => p.id === 'profile-picture');
  
  return (
    <section
      className="w-full py-20 md:py-32 lg:py-40 bg-background"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          {profileImage && (
            <Image
              src={profileImage.imageUrl}
              alt="Gomezgani Shaba"
              width={160}
              height={160}
              className="rounded-full object-cover border-4 border-card shadow-lg"
              data-ai-hint={profileImage.imageHint}
              priority
            />
          )}
          <div className="space-y-2">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Gomezgani Shaba
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              A full-stack developer and data science student focused on building
              secure, data-driven systems.
            </p>
          </div>
          <div className="space-x-4">
            <Button asChild>
              <Link href="#projects">View My Work</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="#contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const AboutSection = () => (
  <section id="about" className="w-full py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl mb-12">
          Building Bridges Between Data and Design
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader className="items-center text-center">
              <Database className="w-12 h-12 mb-4 text-accent" />
              <CardTitle>End-to-End System Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                I architect practical, data-driven systems from the ground up, focusing on the entire application lifecycle—from secure backends to responsive frontends.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="items-center text-center">
              <BrainCircuit className="w-12 h-12 mb-4 text-accent" />
              <CardTitle>Intelligent Application Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                I leverage data science to build intelligent features, applying ML for tasks like transaction classification and creating insightful data simulations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="items-center text-center">
              <ShieldCheck className="w-12 h-12 mb-4 text-accent" />
              <CardTitle>Secure & Scalable Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                I am passionate about creating reliable software for critical sectors like finance and education, building systems that manage sensitive data with trust and security.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>
);

const ProjectsSection = () => {
  const projectImages = PlaceHolderImages;

  return (
    <section id="projects" className="w-full py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
              Selected Projects
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Here are some of the projects I've worked on, showcasing my skills in development and problem-solving.
            </p>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const projectImage = projectImages.find(p => p.id === project.imageId);
            return (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  {projectImage && (
                     <div className="mb-4 overflow-hidden rounded-lg">
                      <Image
                        src={projectImage.imageUrl}
                        alt={project.title}
                        width={800}
                        height={600}
                        className="aspect-[4/3] object-cover transition-transform duration-300 hover:scale-105"
                        data-ai-hint={projectImage.imageHint}
                      />
                     </div>
                  )}
                  <CardDescription className="mb-4">{project.problemStatement}</CardDescription>
                  <div className="mt-auto">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="tech-stack">
                        <AccordionTrigger>Technology Stack</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-2">
                            {project.technologyStack.map((tech, i) => (
                              <Badge key={i} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="architecture">
                        <AccordionTrigger>System Architecture</AccordionTrigger>
                        <AccordionContent>
                          {project.systemArchitecture}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="lessons-learned">
                        <AccordionTrigger>Key Lessons Learned</AccordionTrigger>
                        <AccordionContent>
                          {project.lessonsLearned}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};


const SkillsSection = () => (
  <section id="skills" className="w-full py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
            Technical Skills
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            A snapshot of the languages, frameworks, and tools I use to bring ideas to life.
          </p>
        </div>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {Object.entries(skills).map(([category, skillList]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);


const ContactSection = () => (
  <section id="contact" className="w-full py-16 md:py-24 bg-secondary/50">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
              Get in Touch
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              Have a project in mind, a question, or just want to connect? Feel
              free to reach out. I'm always open to new opportunities and
              collaborations.
            </p>
          </div>
          <div className="space-y-4 text-lg">
            <a
              href="mailto:gomezgani60@gmail.com"
              className="flex items-center gap-4 group"
            >
              <Mail className="h-6 w-6 text-accent" />
              <span className="text-muted-foreground group-hover:text-foreground">
                gomezgani60@gmail.com
              </span>
            </a>
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-accent" />
              <div className="text-muted-foreground">
                <span>+265 986 076 400</span> / <span>+265 887 275 041</span>
              </div>
            </div>
            <a
              href="https://github.com/gomeShaba"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
            >
              <Github className="h-6 w-6 text-accent" />
              <span className="text-muted-foreground group-hover:text-foreground">
                github.com/gomeShaba
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/gomezgani-s-27aa93247"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
            >
              <Linkedin className="h-6 w-6 text-accent" />
              <span className="text-muted-foreground group-hover:text-foreground">
                linkedin.com/in/gomezgani-s-27aa93247
              </span>
            </a>
          </div>
        </div>
        <div className="mx-auto w-full max-w-lg">
          <ContactForm />
        </div>
      </div>
    </div>
  </section>
);


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
